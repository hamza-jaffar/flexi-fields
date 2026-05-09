import ShopifyLayout from '@/layouts/shopify-layout';
import { Page, Card, IndexTable, Text, Badge, EmptyState, useIndexResourceState, Modal, BlockStack, Banner } from '@shopify/polaris';
import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { PlusIcon } from '@shopify/polaris-icons';
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
    const [fieldToDelete, setFieldToDelete] = useState<number | 'bulk' | null>(null);

    const hasFeature = (key: string) => {
        const features = shop.subscription?.plan?.internal_features || [];
        const feature = features.find((f: any) => f.feature_key === key);
        return feature ? feature.feature_value : false;
    };

    const hasBulkActions = hasFeature('bulk_editor');
    const isOverLimit = fieldStats.limit !== -1 && fieldStats.current >= fieldStats.limit;

    const resourceName = {
        singular: 'custom field',
        plural: 'custom fields',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
        useIndexResourceState(customFields);

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
            router.post(customField.bulkDestroy().url, { ids: selectedResources }, {
                onFinish: () => {
                    closeDeleteModal();
                    clearSelection();
                },
            });
        } else if (fieldToDelete !== null) {
            router.delete(customField.destroy({ customField: fieldToDelete }).url, {
                onFinish: () => closeDeleteModal(),
            });
        }
    }, [fieldToDelete, selectedResources, closeDeleteModal, clearSelection]);

    const promotedBulkActions = hasBulkActions ? [
        {
            content: 'Delete fields',
            onAction: handleBulkDeleteClick,
        },
    ] : [];

    const rowMarkup = customFields.map(
        ({ id, name, label, type, target, is_active }, index) => (
            <IndexTable.Row
                id={id.toString()}
                key={id}
                selected={selectedResources.includes(id.toString())}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {name}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{label}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone="info">{type}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge>{target}</Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {is_active ? (
                        <Badge tone="success">Active</Badge>
                    ) : (
                        <Badge tone="critical">Inactive</Badge>
                    )}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            className="text-blue-600 hover:underline cursor-pointer"
                            onClick={() => router.visit(customField.edit({ customField: id }).url)}
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            className="text-red-600 hover:underline cursor-pointer"
                            onClick={() => handleDeleteClick(id)}
                        >
                            Delete
                        </button>
                    </div>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <ShopifyLayout>
            <Head title="Custom Fields" />
            <Page
                title="Custom Fields"
                subtitle="Manage custom product fields and personalization options for your store."
                primaryAction={{
                    content: 'Create Field',
                    icon: PlusIcon,
                    disabled: isOverLimit,
                    onAction: () => {
                        router.visit(customField.create().url);
                    },
                }}
            >
                <BlockStack gap="400">
                    {fieldStats.current > fieldStats.limit && fieldStats.limit !== -1 && (
                        <Banner tone="critical" title="Plan limit exceeded">
                            <p>
                                Your current plan allows a maximum of <strong>{fieldStats.limit}</strong> custom fields, but you currently have <strong>{fieldStats.current}</strong>. 
                                You will not be able to create any new fields until you delete the extra fields or upgrade your plan.
                            </p>
                        </Banner>
                    )}

                    <Card padding="0">
                        {customFields.length > 0 ? (
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={customFields.length}
                                selectedItemsCount={
                                    allResourcesSelected ? 'All' : selectedResources.length
                                }
                                onSelectionChange={handleSelectionChange}
                                promotedBulkActions={promotedBulkActions}
                                headings={[
                                    { title: 'Name' },
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
                            <EmptyState
                                heading="Create custom fields for your products"
                                action={{
                                    content: 'Create Field',
                                    onAction: () => router.visit(customField.create().url),
                                    disabled: isOverLimit,
                                }}
                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                                <p>Collect personalized information from your customers by adding custom fields to products, collections, or cart.</p>
                            </EmptyState>
                        )}
                    </Card>
                </BlockStack>

                <Modal
                    open={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    title={fieldToDelete === 'bulk' ? `Delete ${selectedResources.length} custom fields?` : "Delete custom field?"}
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
