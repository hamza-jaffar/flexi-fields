import React from 'react';
import { AppProvider, Frame } from '@shopify/polaris';
import { NavMenu } from '@shopify/app-bridge-react';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Link } from '@inertiajs/react';

export default function ShopifyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppProvider i18n={enTranslations}>
            <NavMenu>
                <Link href="/app" rel="home">
                    Home
                </Link>
                <Link href="/app/custom-field">Custom Fields</Link>
                <Link href="/app/media">Media Library</Link>
                <Link href="/app/billing">Billing</Link>
                {/* <Link href="/app/settings">Settings</Link> */}
            </NavMenu>
            <Frame>{children}</Frame>
        </AppProvider>
    );
}
