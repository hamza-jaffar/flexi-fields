import ShopifyLayout from '@/layouts/shopify-layout';
import {
    Page,
    Card,
    IndexTable,
    Text,
    Badge,
    EmptyState,
    useIndexResourceState,
    Modal,
    BlockStack,
    Banner,
    Layout,
    Icon,
    Box,
    InlineStack,
    Divider,
    Button,
} from '@shopify/polaris';
import React, { useState, useCallback, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    PlusIcon,
    EditIcon,
    DeleteIcon,
    ViewIcon,
    AlertCircleIcon,
    CheckCircleIcon,
    CollectionIcon,
    PlanIcon,
    HashtagIcon,
    ProductIcon,
    CartIcon,
    CreditCardIcon,
} from '@shopify/polaris-icons';
import customField from '@/routes/app/custom-field';

interface Props {
    customFields: any[];
    shop: any;
    fieldStats: {
        limit: number;
        current: number;
    };
}

const CustomFieldsIndex = ({ customFields, shop, fieldStats }: Props) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState<number | 'bulk' | null>(
        null,
    );

    const hasFeature = (key: string) => {
        const features = shop.subscription?.plan?.internal_features || [];
        const feature = features.find((f: any) => f.feature_key === key);
        return feature ? feature.feature_value : false;
    };

    const hasBulkActions = hasFeature('bulk_editor');
    const isOverLimit =
        fieldStats.limit !== -1 && fieldStats.current >= fieldStats.limit;
    const usagePercentage =
        fieldStats.limit === -1
            ? 0
            : Math.min(100, (fieldStats.current / fieldStats.limit) * 100);

    const resourceName = {
        singular: 'custom field',
        plural: 'custom fields',
    };

    const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection,
    } = useIndexResourceState(customFields);

    const handleDeleteClick = (id: number) => {
        setFieldToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleBulkDeleteClick = () => {
        setFieldToDelete('bulk');
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setFieldToDelete(null);
    }, []);

    const confirmDelete = useCallback(() => {
        if (fieldToDelete === 'bulk') {
            router.post(
                customField.bulkDestroy().url,
                { ids: selectedResources },
                {
                    onFinish: () => {
                        closeDeleteModal();
                        clearSelection();
                    },
                },
            );
        } else if (fieldToDelete !== null) {
            router.delete(
                customField.destroy({ customField: fieldToDelete }).url,
                {
                    onFinish: () => closeDeleteModal(),
                },
            );
        }
    }, [fieldToDelete, selectedResources, closeDeleteModal, clearSelection]);

    const promotedBulkActions = hasBulkActions
        ? [
              {
                  content: 'Delete fields',
                  onAction: handleBulkDeleteClick,
              },
          ]
        : [];

    const getTargetIcon = (target: string) => {
        switch (target) {
            case 'product':
                return ProductIcon;
            case 'collection':
                return CollectionIcon;
            case 'tag':
                return HashtagIcon;
            case 'cart':
                return CartIcon;
            case 'checkout':
                return CreditCardIcon;
            default:
                return ViewIcon;
        }
    };

    const rowMarkup = useMemo(
        () =>
            customFields.map(
                ({ id, name, label, type, target, is_active }, index) => (
                    <IndexTable.Row
                        id={id}
                        key={id}
                        selected={selectedResources.includes(id)}
                        position={index}
                    >
                        <IndexTable.Cell>
                            <Box paddingBlockStart="200" paddingBlockEnd="200">
                                <BlockStack gap="050">
                                    <Text
                                        variant="bodyMd"
                                        fontWeight="bold"
                                        as="span"
                                    >
                                        {name}
                                    </Text>
                                    <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        as="span"
                                    >
                                        ID: {id}
                                    </Text>
                                </BlockStack>
                            </Box>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            <Text variant="bodyMd" as="span">
                                {label}
                            </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            <div className="badge-custom type-badge">
                                {type}
                            </div>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            <div className="badge-custom target-badge">
                                {target}
                            </div>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            <div
                                className={`badge-custom ${is_active ? 'status-active' : 'status-inactive'}`}
                            >
                                {is_active ? 'Active' : 'Inactive'}
                            </div>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            <InlineStack
                                gap="100"
                                wrap={false}
                                blockAlign="center"
                            >
                                <button
                                    type="button"
                                    className="action-button action-button-edit"
                                    onClick={() =>
                                        router.visit(
                                            customField.edit({
                                                customField: id,
                                            }).url,
                                        )
                                    }
                                >
                                    <Icon source={EditIcon} tone="primary" />
                                    <Text
                                        variant="bodySm"
                                        fontWeight="medium"
                                        as="span"
                                    >
                                        Edit
                                    </Text>
                                </button>
                                <button
                                    type="button"
                                    className="action-button action-button-delete"
                                    onClick={() => handleDeleteClick(id)}
                                >
                                    <Icon source={DeleteIcon} tone="critical" />
                                    <Text
                                        variant="bodySm"
                                        fontWeight="medium"
                                        as="span"
                                        tone="critical"
                                    >
                                        Delete
                                    </Text>
                                </button>
                            </InlineStack>
                        </IndexTable.Cell>
                    </IndexTable.Row>
                ),
            ),
        [customFields, selectedResources],
    );

    return (
        <ShopifyLayout>
            <Head title="Custom Fields Dashboard" />
            <Page
                fullWidth
                title="Custom Fields"
                subtitle="Design and deploy personalization fields across your store."
                primaryAction={{
                    content: 'Create New Field',
                    icon: PlusIcon,
                    disabled: isOverLimit,
                    onAction: () => {
                        router.visit(customField.create().url);
                    },
                }}
            >
                <BlockStack gap="600">
                    {fieldStats.current > fieldStats.limit &&
                        fieldStats.limit !== -1 && (
                            <Banner
                                tone="critical"
                                title="Limit Exceeded"
                                icon={AlertCircleIcon}
                            >
                                <p>
                                    Your plan's capacity is full. Please remove
                                    excess fields to restore functionality.
                                </p>
                            </Banner>
                        )}

                    {/* Stats Header */}
                    <Layout>
                        <Layout.Section variant="oneThird">
                            <div
                                className="stat-card animate-fade-in"
                                style={{ animationDelay: '0.1s' }}
                            >
                                <InlineStack
                                    align="space-between"
                                    blockAlign="center"
                                >
                                    <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        fontWeight="medium"
                                        as="span"
                                    >
                                        Total Fields
                                    </Text>
                                    <div className="card-icon-container">
                                        <Icon
                                            source={CollectionIcon}
                                            tone="subdued"
                                        />
                                    </div>
                                </InlineStack>
                                <Text variant="headingXl" as="h2">
                                    {fieldStats.current}
                                </Text>
                                <Text variant="bodySm" tone="subdued" as="p">
                                    active and inactive fields
                                </Text>
                            </div>
                        </Layout.Section>
                        <Layout.Section variant="oneThird">
                            <div
                                className="stat-card animate-fade-in"
                                style={{ animationDelay: '0.2s' }}
                            >
                                <InlineStack
                                    align="space-between"
                                    blockAlign="center"
                                >
                                    <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        fontWeight="medium"
                                        as="span"
                                    >
                                        Plan Usage
                                    </Text>
                                    <div className="card-icon-container">
                                        <Icon
                                            source={CheckCircleIcon}
                                            tone="success"
                                        />
                                    </div>
                                </InlineStack>
                                <InlineStack
                                    gap="200"
                                    align="start"
                                    blockAlign="baseline"
                                >
                                    <Text variant="headingXl" as="h2">
                                        {fieldStats.current}
                                    </Text>
                                    <Text
                                        variant="bodyMd"
                                        tone="subdued"
                                        as="span"
                                    >
                                        /{' '}
                                        {fieldStats.limit === -1
                                            ? '∞'
                                            : fieldStats.limit}
                                    </Text>
                                </InlineStack>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${usagePercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </Layout.Section>
                        <Layout.Section variant="oneThird">
                            <div
                                className="stat-card animate-fade-in"
                                style={{ animationDelay: '0.3s' }}
                            >
                                <InlineStack
                                    align="space-between"
                                    blockAlign="center"
                                >
                                    <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        fontWeight="medium"
                                        as="span"
                                    >
                                        Active Plan
                                    </Text>
                                    <div className="card-icon-container">
                                        <Icon source={PlanIcon} tone="info" />
                                    </div>
                                </InlineStack>
                                <Text variant="headingLg" as="h2">
                                    {shop.subscription?.plan?.name ||
                                        'Free Plan'}
                                </Text>
                                <Box marginBlockStart="200">
                                    <Button
                                        variant="plain"
                                        onClick={() =>
                                            router.visit('/app/billing')
                                        }
                                    >
                                        Upgrade Plan
                                    </Button>
                                </Box>
                            </div>
                        </Layout.Section>
                    </Layout>

                    <Card padding="0">
                        <Box padding="400">
                            <InlineStack
                                align="space-between"
                                blockAlign="center"
                            >
                                <BlockStack gap="050">
                                    <Text variant="headingMd" as="h3">
                                        All Custom Fields
                                    </Text>
                                    <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        as="p"
                                    >
                                        Manage and monitor your personalization
                                        rules
                                    </Text>
                                </BlockStack>
                                {customFields.length > 0 && (
                                    <Badge tone="info" progress="complete">
                                        {customFields.length}{' '}
                                        {customFields.length === 1
                                            ? 'Field'
                                            : 'Fields'}{' '}
                                        Total
                                    </Badge>
                                )}
                            </InlineStack>
                        </Box>
                        <Divider />
                        {customFields.length > 0 ? (
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={customFields.length}
                                selectedItemsCount={
                                    allResourcesSelected
                                        ? 'All'
                                        : selectedResources.length
                                }
                                onSelectionChange={handleSelectionChange}
                                promotedBulkActions={promotedBulkActions}
                                headings={[
                                    { title: 'Field Name' },
                                    { title: 'Label' },
                                    { title: 'Type' },
                                    { title: 'Target' },
                                    { title: 'Status' },
                                    { title: 'Actions' },
                                ]}
                            >
                                {rowMarkup}
                            </IndexTable>
                        ) : (
                            <Box padding="800">
                                <EmptyState
                                    heading="Start building your custom fields"
                                    action={{
                                        content: 'Create Your First Field',
                                        onAction: () =>
                                            router.visit(
                                                customField.create().url,
                                            ),
                                        disabled: isOverLimit,
                                        icon: PlusIcon,
                                    }}
                                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                >
                                    <p>
                                        Collect personalized information from
                                        your customers by adding custom fields
                                        to products, collections, or cart.
                                    </p>
                                </EmptyState>
                            </Box>
                        )}
                    </Card>
                </BlockStack>

                <Modal
                    open={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    title={
                        fieldToDelete === 'bulk'
                            ? `Delete ${selectedResources.length} custom fields?`
                            : 'Delete custom field?'
                    }
                    primaryAction={{
                        content: 'Delete',
                        onAction: confirmDelete,
                        destructive: true,
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: closeDeleteModal,
                        },
                    ]}
                >
                    <Modal.Section>
                        <BlockStack gap="400">
                            <Text as="p">
                                {fieldToDelete === 'bulk'
                                    ? `Are you sure you want to delete ${selectedResources.length} custom fields? This action cannot be undone.`
                                    : `Are you sure you want to delete this custom field? This action cannot be undone and the field will immediately be removed from your storefront.`}
                            </Text>
                        </BlockStack>
                    </Modal.Section>
                </Modal>
            </Page>
        </ShopifyLayout>
    );
};

export default CustomFieldsIndex;
