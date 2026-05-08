import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import { NavMenu } from "@shopify/app-bridge-react";

const ShopifyLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AppProvider i18n={enTranslations}>
            <NavMenu>
                <a href="/app" rel="home">
                    Dashboard
                </a>
                <a href="/app/custom-fields">Custom Fields</a>
                <a href="/app/settings">Settings</a>
            </NavMenu>
            {children}
        </AppProvider>
    );
};

export default ShopifyLayout;
