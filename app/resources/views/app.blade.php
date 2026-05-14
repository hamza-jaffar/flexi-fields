<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="shopify-api-key" content="{{ config('shopify.api_key') }}" />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge/latest/app-bridge.umd.js"></script>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/logo.jpg" type="image/jpeg">
        <link rel="apple-touch-icon" href="/logo.jpg">

        <!-- SEO Meta Tags -->
        <title>Flexi Fields - Custom Fields for Shopify</title>
        <meta name="description" content="Add dynamic custom fields and price addons to your Shopify store with ease.">
        <meta property="og:title" content="Flexi Fields - Custom Fields for Shopify">
        <meta property="og:description" content="Add dynamic custom fields and price addons to your Shopify store with ease.">
        <meta property="og:image" content="/logo.jpg">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Flexi Fields - Custom Fields for Shopify">
        <meta name="twitter:description" content="Add dynamic custom fields and price addons to your Shopify store with ease.">
        <meta name="twitter:image" content="/logo.jpg">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head />
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
