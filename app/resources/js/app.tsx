import { createInertiaApp, router } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import '@shopify/polaris/build/esm/styles.css';
import '@/../css/shopify.css';
import Prism from 'prismjs';
(window as any).Prism = Prism;

// Intercept Inertia requests to add the Shopify Session Token
router.on('before', (event) => {
    // If we already have the token in the headers, let the request proceed
    if (event.detail.visit.headers['Authorization']) {
        return;
    }

    // If shopify app bridge is available, we must fetch a token
    if (typeof (window as any).shopify !== 'undefined') {
        // Stop the current visit
        event.preventDefault();

        // Fetch the token and restart the visit
        (window as any).shopify.idToken().then((token: string) => {
            router.visit(event.detail.visit.url, {
                ...event.detail.visit,
                headers: {
                    ...event.detail.visit.headers,
                    'Authorization': `Bearer ${token}`,
                },
                // Important: tell Inertia not to trigger the 'before' hook again for this specific call 
                // but since we added the header, our check above will handle it.
            });
        });
    }
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('frontend/'):
                return null;
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name.startsWith('admin/'):
                return AppLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
