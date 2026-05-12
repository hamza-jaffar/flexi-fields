import ShopifyLayout from '@/layouts/shopify-layout';
import {
    Page,
    Layout,
    Card,
    Text,
    BlockStack,
    InlineStack,
    Box,
    Icon,
    ProgressBar,
    Badge,
    InlineGrid,
    Button,
    EmptyState,
    Pagination,
    Tooltip,
} from '@shopify/polaris';
import {
    DeleteIcon,
    ViewIcon,
    ImageIcon,
    ArchiveIcon,
    AlertCircleIcon,
} from '@shopify/polaris-icons';
import { Head, router, usePage } from '@inertiajs/react';
import app from '@/routes/app';
import { useState } from 'react';
import { progessBarTone } from '@/lib/utils';

interface MediaItem {
    id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    path: string;
    url: string;
    product_id: string | null;
    created_at: string;
}

interface Props {
    media: {
        data: MediaItem[];
        links: any[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    stats: {
        used_bytes: number;
        limit_mb: number;
        percentage: number;
    };
}

const MediaIndex = ({ media, stats }: Props) => {
    const { shop } = usePage<{ shop: any }>().props;
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        );
    };

    const handleDelete = (id: number) => {
        if (
            confirm(
                'Are you sure you want to delete this file? This action cannot be undone.',
            )
        ) {
            setIsDeleting(id);
            router.delete(app.media.destroy(id).url, {
                data: { shop: shop.shop_domain },
                onFinish: () => setIsDeleting(null),
            });
        }
    };

    const renderMediaItem = (item: MediaItem) => (
        <Card key={item.id} padding="0">
            <Box position="relative">
                <div
                    style={{
                        aspectRatio: '1/1',
                        overflow: 'hidden',
                        background: '#f1f1f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px 8px 0 0',
                    }}
                >
                    <img
                        src={item.url}
                        alt={item.original_name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
                        }}
                    />
                </div>
                <Box
                    position="absolute"
                    insetBlockStart="200"
                    insetInlineEnd="200"
                >
                    <InlineStack gap="100">
                        <Tooltip content="View Original">
                            <Button
                                size="slim"
                                icon={ViewIcon}
                                onClick={() => window.open(item.url, '_blank')}
                            />
                        </Tooltip>
                        <Tooltip content="Delete">
                            <Button
                                size="slim"
                                tone="critical"
                                icon={DeleteIcon}
                                loading={isDeleting === item.id}
                                onClick={() => handleDelete(item.id)}
                            />
                        </Tooltip>
                    </InlineStack>
                </Box>
            </Box>
            <Box padding="300">
                <BlockStack gap="100">
                    <Text as="p" variant="bodySm" fontWeight="bold" truncate>
                        {item.original_name}
                    </Text>
                    <InlineStack align="space-between">
                        <Text as="p" variant="bodyXs" tone="subdued">
                            {formatBytes(item.file_size)}
                        </Text>
                        <Text as="p" variant="bodyXs" tone="subdued">
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </InlineStack>
                </BlockStack>
            </Box>
        </Card>
    );

    return (
        <ShopifyLayout>
            <Head title="Media Library" />
            <Page
                title="Media Library"
                subtitle="View and manage all files uploaded by your customers."
                primaryAction={
                    <Button
                        variant="primary"
                        onClick={() =>
                            router.visit(app.index().url, {
                                data: { shop: shop.shop_domain },
                            })
                        }
                    >
                        Go to Dashboard
                    </Button>
                }
            >
                <BlockStack gap="600">
                    {/* Storage Info Card */}
                    <Card>
                        <BlockStack gap="400">
                            <InlineStack gap="200" blockAlign="center">
                                <Box
                                    background="bg-surface-secondary"
                                    padding="100"
                                    borderRadius="150"
                                >
                                    <Icon source={ArchiveIcon} tone="subdued" />
                                </Box>
                                <Text variant="headingMd" as="h3">
                                    Storage Usage
                                </Text>
                            </InlineStack>

                            <BlockStack gap="200">
                                <InlineStack align="space-between">
                                    <Text
                                        as="p"
                                        variant="bodyMd"
                                        tone="subdued"
                                    >
                                        Total space used:{' '}
                                        <Text
                                            as="span"
                                            fontWeight="bold"
                                            tone="base"
                                        >
                                            {formatBytes(stats.used_bytes)}
                                        </Text>
                                    </Text>
                                    <Text
                                        as="p"
                                        variant="bodyMd"
                                        tone="subdued"
                                    >
                                        Limit:{' '}
                                        {stats.limit_mb === -1
                                            ? 'Unlimited'
                                            : `${stats.limit_mb} MB`}
                                    </Text>
                                </InlineStack>
                                <ProgressBar
                                    progress={stats.percentage}
                                    tone={progessBarTone(stats.percentage)}
                                />
                                {stats.percentage > 90 && (
                                    <InlineStack gap="100" blockAlign="center">
                                        <Icon
                                            source={AlertCircleIcon}
                                            tone="critical"
                                        />
                                        <Text
                                            as="p"
                                            variant="bodySm"
                                            tone="critical"
                                        >
                                            You are almost out of storage.
                                            Consider deleting old files or
                                            upgrading your plan.
                                        </Text>
                                    </InlineStack>
                                )}
                            </BlockStack>
                        </BlockStack>
                    </Card>

                    {/* Media Grid */}
                    {media.data.length > 0 ? (
                        <BlockStack gap="400">
                            <InlineGrid
                                columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}
                                gap="400"
                            >
                                {media.data.map(renderMediaItem)}
                            </InlineGrid>

                            {(media.prev_page_url || media.next_page_url) && (
                                <Box paddingBlockStart="400">
                                    <InlineStack align="center">
                                        <Pagination
                                            hasPrevious={!!media.prev_page_url}
                                            onPrevious={() =>
                                                router.visit(
                                                    media.prev_page_url!,
                                                    {
                                                        data: {
                                                            shop: shop.shop_domain,
                                                        },
                                                    },
                                                )
                                            }
                                            hasNext={!!media.next_page_url}
                                            onNext={() =>
                                                router.visit(
                                                    media.next_page_url!,
                                                    {
                                                        data: {
                                                            shop: shop.shop_domain,
                                                        },
                                                    },
                                                )
                                            }
                                        />
                                    </InlineStack>
                                </Box>
                            )}
                        </BlockStack>
                    ) : (
                        <Card>
                            <EmptyState
                                heading="No files uploaded yet"
                                action={{
                                    content: 'Check your fields',
                                    onAction: () =>
                                        router.visit(
                                            app.customField.index().url,
                                            {
                                                data: {
                                                    shop: shop.shop_domain,
                                                },
                                            },
                                        ),
                                }}
                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                                <p>
                                    Once customers start uploading files via
                                    your custom fields, they will appear here.
                                </p>
                            </EmptyState>
                        </Card>
                    )}
                </BlockStack>
            </Page>
        </ShopifyLayout>
    );
};

export default MediaIndex;
