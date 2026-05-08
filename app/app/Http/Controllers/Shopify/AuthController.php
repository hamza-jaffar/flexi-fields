<?php

namespace App\Http\Controllers\Shopify;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Class AuthController
 *
 * Handles the Shopify OAuth lifecycle including installation,
 * authentication, and token management.
 */
class AuthController extends Controller
{
    /**
     * Entry Point: The "Gatekeeper" route.
     *
     * This method is triggered when a user opens the app from the Shopify Admin.
     * It determines if the store is a new install or an existing user.
     */
    public function index(Request $request)
    {
        // Every request from Shopify contains the 'shop' query parameter (e.g., store.myshopify.com)
        $shopDomain = $request->query('shop');

        // Safety Check: If no shop is provided, the request is invalid/external.
        if (! $shopDomain) {
            return response()->json([
                'error' => 'Missing shop parameter. Please launch the app from Shopify.',
            ], 400);
        }

        try {
            // Retrieve shop details from the database
            $shop = Shop::where('shop_domain', $shopDomain)->first();

            if ($shop) {
                /**
                 * Token Expiry Check
                 * For apps using Online/Expiring tokens, we check if the current session is still valid.
                 * If expired, we force a re-authentication via the /auth route.
                 */
                if (($shop->access_token_expires_at && $shop->access_token_expires_at < now()) || $shop->uninstalled_at) {
                    return redirect()->route('auth', $request->query());
                }

                /**
                 * Authenticated: Load UI
                 * The merchant is verified. Here we return a 200 or redirect to the Inertia Dashboard.
                 */
                return redirect()->route('app.index', $request->query());
            }

            /**
             * Fresh Install: Initiate OAuth
             * If the shop domain is not in our database, we start the installation flow.
             */
            return redirect()->route('auth', $request->query());

        } catch (\Exception $e) {
            Log::error('Authentication Bridge Error: ' . $e->getMessage());

            return response()->json([
                'error' => 'Something went wrong while loading the app.',
            ], 500);
        }
    }

    /**
     * Step 1: Redirect to Shopify Authorization
     *
     * Prepares the parameters and redirects the user to Shopify's permission screen.
     */
    public function auth(Request $request)
    {
        $shop = $request->query('shop');

        if (! $shop) {
            return response()->json(['error' => 'Missing shop parameter.'], 400);
        }

        try {
            $apiKey = config('shopify.api_key');
            $scopes = config('shopify.scopes');
            $redirectUri = config('shopify.redirect_uri');

            /**
             * Security: Anti-Forgery State (Nonce)
             * We generate a random string to verify that the callback
             * we receive later actually originated from this request.
             */
            $nonce = bin2hex(random_bytes(16));
            session(['shopify_nonce' => $nonce]);
            session()->save();

            // Construct the Shopify OAuth URL
            $authUrl = "https://{$shop}/admin/oauth/authorize?" . http_build_query([
                'client_id' => $apiKey,
                'scope' => $scopes,
                'redirect_uri' => $redirectUri,
                'state' => $nonce,
                'grant_options[]' => 'value', // Can be 'per-user' for online tokens
            ]);

            /**
             * Frame-Busting Redirect
             * Because the app is loaded in an iFrame, we must use JavaScript
             * to redirect the top-level window to Shopify's auth page.
             */
            return response("<!DOCTYPE html><html><head><script>window.top.location.href = '{$authUrl}';</script></head><body>Redirecting to Shopify...</body></html>");

        } catch (\Exception $e) {
            Log::error("OAuth Initiation Failed: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Step 2: OAuth Callback Handling
     *
     * Shopify returns the user here with a temporary 'code'
     * which we exchange for a permanent Access Token.
     */
    public function callback(Request $request)
    {
        $params = $request->all();
        $shop = $request->query('shop');
        $code = $request->query('code');
        $state = $request->query('state');

        // Security Check 1: Verify the Nonce (State)
        if (! $state || $state !== session('shopify_nonce')) {
            Log::warning('Security Alert: Invalid nonce/state detected during callback.');
            return response()->json(['error' => 'Invalid state. Possible CSRF attempt.'], 401);
        }

        // Security Check 2: Verify the HMAC Signature
        // This ensures the data sent to this route was signed by Shopify and not tampered with.
        if (! $this->verifyHmac($params)) {
            Log::warning('Security Alert: HMAC verification failed.');
            return response()->json(['error' => 'HMAC verification failed.'], 401);
        }

        try {
            /**
             * Token Exchange
             * Trading the temporary 'code' for the 'access_token'.
             */
            $response = Http::post("https://{$shop}/admin/oauth/access_token", [
                'client_id' => config('shopify.api_key'),
                'client_secret' => config('shopify.api_secret'),
                'code' => $code,
                'expiring' => 1,
            ]);

            if ($response->failed()) {
                Log::error('Shopify Token Exchange Failed', ['body' => $response->body()]);
                return response()->json(['error' => 'Failed to retrieve access token from Shopify.'], 500);
            }

            $tokenData = $response->json();
            $accessToken = $tokenData['access_token'];

            /**
             * Profile Fetching
             * Retrieve basic shop information (Name, Email, etc.) to store locally.
             */
            $shopInfoResponse = Http::withHeaders([
                'X-Shopify-Access-Token' => $accessToken,
            ])->get("https://{$shop}/admin/api/2024-04/shop.json");

            $shopData = $shopInfoResponse->json()['shop'] ?? [];

            /**
             * Database Persistence
             * Create or update the shop record with the new access token.
             */
            $shopModel = Shop::updateOrCreate(
                ['shop_domain' => $shop],
                [
                    'name' => $shopData['name'] ?? null,
                    'access_token' => $accessToken,
                    'refresh_token' => $tokenData['refresh_token'] ?? null,
                    'access_token_expires_at' => isset($tokenData['expires_in']) ? now()->addSeconds($tokenData['expires_in']) : null,
                    'refresh_token_expires_at' => isset($tokenData['refresh_token_expires_in']) ? now()->addSeconds($tokenData['refresh_token_expires_in']) : null,
                    'token_mode' => isset($tokenData['refresh_token']) ? 'offline_expiring' : 'offline_nonexpiring',
                    'shop_owner_email' => $shopData['email'] ?? null,
                    'scopes' => $tokenData['scope'] ?? null,
                    'installed_at' => now(),
                    'uninstalled_at' => null,
                    'last_synced_at' => now(),
                ]
            );

            // Housekeeping: Register mandatory webhooks
            $this->registerUninstallWebhook($shop, $accessToken);

            // Clean up session security data
            session()->forget('shopify_nonce');

            // Success: Redirect to the main application dashboard
            return redirect()->route('app.index', $request->query());

        } catch (\Exception $e) {
            Log::error("OAuth Callback Processing Failed: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Webhook Registration: App Uninstalled
     *
     * Notifies our server when a merchant deletes the app so we can
     * clean up data or stop billing.
     */
    private function registerUninstallWebhook(string $shop, string $accessToken): void
    {
        $webhookUrl = config('app.url') . '/webhooks/app/uninstalled';

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $accessToken,
        ])->post("https://{$shop}/admin/api/2024-04/webhooks.json", [
            'webhook' => [
                'topic' => 'app/uninstalled',
                'address' => $webhookUrl,
                'format' => 'json',
            ],
        ]);

        if ($response->successful()) {
            Log::info("Webhook Success: Uninstall listener registered for {$shop}");
        } else {
            Log::error("Webhook Failure: Could not register uninstall for {$shop}: " . $response->body());
        }
    }

    /**
     * Security Helper: HMAC Verification
     *
     * Reconstructs the query string and hashes it with the API Secret to
     * compare against Shopify's signature.
     */
    private function verifyHmac(array $params): bool
    {
        $hmac = $params['hmac'] ?? '';
        unset($params['hmac']);

        // Alphabetical sort of keys is mandatory for HMAC calculation
        ksort($params);

        $pairs = [];
        foreach ($params as $key => $value) {
            $pairs[] = "$key=$value";
        }
        $message = implode('&', $pairs);

        $calculatedHmac = hash_hmac('sha256', $message, config('shopify.api_secret'));

        return hash_equals($hmac, $calculatedHmac);
    }
}
