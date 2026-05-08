import ShopifyLayout from "@/Layouts/ShopifyLayout";
import { Frame, Page, Card, Button } from "@shopify/polaris";

const Welcome = () => {
    return (
        <ShopifyLayout>
            <Frame>
                <Page
                    title="Welcome to Flexi Fields"
                    primaryAction={{
                        content: "Get started",
                        onAction: () => {
                            console.log("Get started clicked");
                        },
                    }}
                >
                    <Card>
                        <p>
                            Manage your custom fields and settings using this
                            simple UI.
                        </p>
                        <Button onClick={() => console.log("Button clicked")}>
                            Example Button
                        </Button>
                    </Card>
                </Page>
            </Frame>
        </ShopifyLayout>
    );
};

export default Welcome;
