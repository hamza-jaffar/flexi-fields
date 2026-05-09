import ShopifyLayout from '@/layouts/shopify-layout';
import {
    Page,
    Layout,
    Card,
    FormLayout,
    TextField,
    Select,
    Checkbox,
    BlockStack,
    Text,
    Banner,
    InlineGrid,
    Divider,
    Box,
    Tabs,
    Button,
    Icon,
    InlineStack
} from '@shopify/polaris';
import React, { useState, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import customFieldRoutes from '@/routes/app/custom-field';
import { Switch } from '@/components/ui/switch'; // For preview
import { DeleteIcon, PlusIcon } from '@shopify/polaris-icons';

interface Props {
    shop: any;
}

const CreateCustomFieldPage = ({ shop }: Props) => {
    const hasFeature = (key: string) => {
        const features = shop.subscription?.plan?.internal_features || [];
        const feature = features.find((f: any) => f.feature_key === key);
        return feature ? feature.feature_value : false;
    };

    const hasAdvancedFields = hasFeature('advanced_field_types');
    const hasPriceAddons = hasFeature('price_addons');
    const hasConditionalLogic = hasFeature('conditional_logic');
    const hasCustomStyling = hasFeature('custom_styling');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        type: 'text',
        label: '',
        placeholder: '',
        help_text: '',
        is_required: false,
        min_length: '',
        max_length: '',
        min_value: '',
        max_value: '',
        has_price_addon: false,
        price: '0.00',
        is_active: true,
        sort_order: 0,
        target: 'product',
        target_ids: [],
        options: [{ label: 'Option 1', value: 'option_1' }],
        settings: {
            custom_css: '',
        },
        conditions: [],
    });

    const [selectedTab, setSelectedTab] = useState(0);

    const tabs = [
        { id: 'general', content: 'General', accessibilityLabel: 'General information' },
        { id: 'setup', content: 'Field Setup', accessibilityLabel: 'Field setup and type' },
        { id: 'appearance', content: 'Appearance', accessibilityLabel: 'Appearance' },
        { id: 'validation', content: 'Validation & Pricing', accessibilityLabel: 'Validation and pricing' },
        { id: 'conditions', content: 'Conditions', accessibilityLabel: 'Conditional logic' },
    ];

    const handleSubmit = () => {
        post(customFieldRoutes.store().url);
    };

    const handleNameChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            name: value,
            slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            label: prev.label || value,
        }));
    };

    const addOption = () => {
        setData('options', [...data.options, { label: `Option ${data.options.length + 1}`, value: `option_${data.options.length + 1}` }]);
    };

    const updateOption = (index: number, key: string, value: string) => {
        const newOptions = [...data.options];
        newOptions[index] = { ...newOptions[index], [key]: value };
        setData('options', newOptions);
    };

    const removeOption = (index: number) => {
        const newOptions = [...data.options];
        newOptions.splice(index, 1);
        setData('options', newOptions);
    };

    const renderPreview = () => {
        return (
            <div style={{ padding: '16px', border: '1px solid #dfe3e8', borderRadius: '8px', background: '#ffffff' }}>
                <Text variant="headingSm" as="h3" fontWeight="medium">
                    {data.label || 'Field Label'} {data.is_required && <span style={{ color: 'red' }}>*</span>}
                </Text>
                {data.help_text && (
                    <Text variant="bodySm" tone="subdued" as="p">
                        {data.help_text}
                    </Text>
                )}
                <div style={{ marginTop: '8px' }}>
                    {data.type === 'text' && <input type="text" placeholder={data.placeholder} className="w-full p-2 border rounded" readOnly />}
                    {data.type === 'textarea' && <textarea placeholder={data.placeholder} className="w-full p-2 border rounded" readOnly />}
                    {data.type === 'number' && <input type="number" placeholder={data.placeholder} className="w-full p-2 border rounded" readOnly />}
                    {data.type === 'select' && (
                        <select className="w-full p-2 border rounded">
                            {data.options.length > 0 ? (
                                data.options.map((opt: any, i) => <option key={i} value={opt.value}>{opt.label}</option>)
                            ) : (
                                <option>Example Option</option>
                            )}
                        </select>
                    )}
                    {data.type === 'checkbox' && (
                        <label className="flex items-center gap-2">
                            <input type="checkbox" readOnly /> {data.label || 'Checkbox'}
                        </label>
                    )}
                    {data.type === 'switch' && (
                        <div className="flex items-center gap-2">
                            <Switch /> <span>{data.label || 'Toggle Switch'}</span>
                        </div>
                    )}
                    {data.type === 'color_swatch' && (
                        <div className="flex gap-2 mt-2">
                            {data.options.length > 0 ? (
                                data.options.map((opt: any, i) => (
                                    <div key={i} title={opt.label} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: opt.value.match(/^#([0-9a-f]{3}){1,2}$/i) ? opt.value : '#ccc', border: '1px solid #ccc', cursor: 'pointer' }} />
                                ))
                            ) : (
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#000' }} />
                            )}
                        </div>
                    )}
                    {data.type === 'file_upload' && (
                        <div className="w-full p-4 border-2 border-dashed rounded text-center text-gray-500 bg-gray-50">
                            Drop a file here to upload
                        </div>
                    )}
                    {data.type === 'date_picker' && (
                        <input type="date" className="w-full p-2 border rounded" readOnly />
                    )}
                </div>
            </div>
        );
    };

    return (
        <ShopifyLayout>
            <Head title="Create Custom Field" />
            <Page
                breadcrumbs={[{ content: 'Custom Fields', onAction: () => router.visit(customFieldRoutes.index().url) }]}
                title="Create Custom Field"
                primaryAction={{
                    content: 'Save Field',
                    onAction: handleSubmit,
                    loading: processing,
                }}
            >
                <Layout>
                    <Layout.Section>
                        <Card padding="0">
                            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                                <Box padding="500">
                                    {selectedTab === 0 && (
                                        <BlockStack gap="400">
                                            <FormLayout>
                                                <FormLayout.Group>
                                                    <TextField
                                                        label="Internal Name"
                                                        value={data.name}
                                                        onChange={handleNameChange}
                                                        autoComplete="off"
                                                        error={errors.name}
                                                        helpText="For internal reference"
                                                    />
                                                    <TextField
                                                        label="Unique Handle"
                                                        value={data.slug}
                                                        onChange={(val) => setData('slug', val)}
                                                        autoComplete="off"
                                                        error={errors.slug}
                                                    />
                                                </FormLayout.Group>
                                                
                                                <FormLayout.Group>
                                                    <Select
                                                        label="Field Target"
                                                        options={[
                                                            { label: 'Product', value: 'product' },
                                                            { label: 'Collection', value: 'collection' },
                                                            { label: 'Cart', value: 'cart' },
                                                            { label: 'Checkout', value: 'checkout' },
                                                        ]}
                                                        value={data.target}
                                                        onChange={(val) => setData('target', val)}
                                                        helpText="Where should this field appear?"
                                                    />
                                                    <TextField
                                                        label="Sort Order"
                                                        type="number"
                                                        value={data.sort_order.toString()}
                                                        onChange={(val) => setData('sort_order', parseInt(val, 10) || 0)}
                                                        autoComplete="off"
                                                        helpText="Lower numbers appear first"
                                                    />
                                                </FormLayout.Group>

                                                {(data.target === 'product' || data.target === 'collection') && (
                                                    <Box paddingBlockStart="200">
                                                        <Text as="p" variant="bodyMd">
                                                            Assign to specific {data.target}s (Optional). If none selected, applies to all.
                                                        </Text>
                                                        <div style={{ marginTop: '8px' }}>
                                                            <button
                                                                type="button"
                                                                className="px-4 py-2 border rounded shadow-sm hover:bg-gray-50 bg-white cursor-pointer"
                                                                onClick={async () => {
                                                                    const selection = await window.shopify.resourcePicker({
                                                                        type: data.target,
                                                                        multiple: true,
                                                                    });
                                                                    if (selection) setData('target_ids', selection.map((s: any) => s.id));
                                                                }}
                                                            >
                                                                Select {data.target === 'product' ? 'Products' : 'Collections'} ({data.target_ids ? data.target_ids.length : 0} selected)
                                                            </button>
                                                            {data.target_ids && data.target_ids.length > 0 && (
                                                                <button type="button" className="text-red-600 ml-4 hover:underline cursor-pointer text-sm" onClick={() => setData('target_ids', [])}>
                                                                    Clear selection
                                                                </button>
                                                            )}
                                                        </div>
                                                    </Box>
                                                )}

                                                <Checkbox
                                                    label="Active"
                                                    checked={data.is_active}
                                                    onChange={(val) => setData('is_active', val)}
                                                    helpText="If unchecked, this field will be hidden from the storefront."
                                                />
                                            </FormLayout>
                                        </BlockStack>
                                    )}

                                    {selectedTab === 1 && (
                                        <BlockStack gap="400">
                                            {!hasAdvancedFields && (
                                                <Banner tone="info">Upgrade to unlock Advanced fields.</Banner>
                                            )}
                                            <Select
                                                label="Field Type"
                                                options={[
                                                    { label: 'Single line text', value: 'text' },
                                                    { label: 'Multi-line text', value: 'textarea' },
                                                    { label: 'Number', value: 'number' },
                                                    { label: 'Select dropdown', value: 'select' },
                                                    { label: 'Checkbox', value: 'checkbox' },
                                                    { label: 'Switch', value: 'switch' },
                                                    { label: 'File Upload (Requires Advanced)', value: 'file_upload', disabled: !hasAdvancedFields },
                                                    { label: 'Date Picker (Requires Advanced)', value: 'date_picker', disabled: !hasAdvancedFields },
                                                    { label: 'Color Swatch (Requires Advanced)', value: 'color_swatch', disabled: !hasAdvancedFields },
                                                ]}
                                                value={data.type}
                                                onChange={(val) => setData('type', val)}
                                            />

                                            {(data.type === 'select' || data.type === 'color_swatch') && (
                                                <Card background="bg-surface-secondary">
                                                    <BlockStack gap="400">
                                                        <BlockStack gap="200">
                                                            <Text variant="headingSm" as="h3">Dropdown Options</Text>
                                                            <Text as="p" variant="bodySm" tone="subdued">Define the available options for this field.</Text>
                                                        </BlockStack>
                                                        
                                                        {data.options.map((opt: any, index: number) => (
                                                            <InlineStack key={index} gap="300" align="start" blockAlign="center">
                                                                <div style={{ flex: 1 }}>
                                                                    <TextField
                                                                        label="Label"
                                                                        labelHidden
                                                                        placeholder="Label (e.g. Red)"
                                                                        value={opt.label}
                                                                        onChange={(val) => updateOption(index, 'label', val)}
                                                                        autoComplete="off"
                                                                    />
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <TextField
                                                                        label="Value"
                                                                        labelHidden
                                                                        placeholder={data.type === 'color_swatch' ? "Value (e.g. #FF0000)" : "Value (e.g. red)"}
                                                                        value={opt.value}
                                                                        onChange={(val) => updateOption(index, 'value', val)}
                                                                        autoComplete="off"
                                                                    />
                                                                </div>
                                                                <Button icon={DeleteIcon} tone="critical" accessibilityLabel="Remove option" onClick={() => removeOption(index)} />
                                                            </InlineStack>
                                                        ))}
                                                        
                                                        <div style={{ marginTop: '8px' }}>
                                                            <Button icon={PlusIcon} onClick={addOption}>Add Option</Button>
                                                        </div>
                                                    </BlockStack>
                                                </Card>
                                            )}
                                        </BlockStack>
                                    )}

                                    {selectedTab === 2 && (
                                        <BlockStack gap="400">
                                            <TextField
                                                label="Field Label"
                                                value={data.label}
                                                onChange={(val) => setData('label', val)}
                                                autoComplete="off"
                                                helpText="What the customer will see"
                                            />
                                            <TextField
                                                label="Placeholder text"
                                                value={data.placeholder}
                                                onChange={(val) => setData('placeholder', val)}
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Help text / Tooltip"
                                                value={data.help_text}
                                                onChange={(val) => setData('help_text', val)}
                                                autoComplete="off"
                                            />

                                            {!hasCustomStyling && (
                                                <Banner tone="info">Custom styling requires a higher tier plan.</Banner>
                                            )}
                                            <TextField
                                                label="Custom CSS Classes"
                                                value={data.settings.custom_css || ''}
                                                onChange={(val) => setData('settings', { ...data.settings, custom_css: val })}
                                                autoComplete="off"
                                                disabled={!hasCustomStyling}
                                                helpText="Inject custom CSS classes to match your theme"
                                            />
                                        </BlockStack>
                                    )}

                                    {selectedTab === 3 && (
                                        <BlockStack gap="400">
                                            <Checkbox
                                                label="Make this field required"
                                                checked={data.is_required}
                                                onChange={(val) => setData('is_required', val)}
                                            />
                                            
                                            {(data.type === 'text' || data.type === 'textarea') && (
                                                <InlineGrid columns={2} gap="400">
                                                    <TextField label="Min length" type="number" value={data.min_length} onChange={(val) => setData('min_length', val)} autoComplete="off" />
                                                    <TextField label="Max length" type="number" value={data.max_length} onChange={(val) => setData('max_length', val)} autoComplete="off" />
                                                </InlineGrid>
                                            )}

                                            {data.type === 'number' && (
                                                <InlineGrid columns={2} gap="400">
                                                    <TextField label="Min value" type="number" value={data.min_value} onChange={(val) => setData('min_value', val)} autoComplete="off" />
                                                    <TextField label="Max value" type="number" value={data.max_value} onChange={(val) => setData('max_value', val)} autoComplete="off" />
                                                </InlineGrid>
                                            )}

                                            <Divider />
                                            <Text variant="headingMd" as="h2">Pricing Add-ons</Text>
                                            {!hasPriceAddons && <Banner tone="info">Price add-ons require a higher tier plan.</Banner>}
                                            <Checkbox
                                                label="Add a cost to this field"
                                                checked={data.has_price_addon}
                                                onChange={(val) => setData('has_price_addon', val)}
                                                disabled={!hasPriceAddons}
                                            />
                                            {data.has_price_addon && (
                                                <TextField label="Additional Price" type="number" prefix="$" value={data.price} onChange={(val) => setData('price', val)} autoComplete="off" />
                                            )}
                                        </BlockStack>
                                    )}

                                    {selectedTab === 4 && (
                                        <BlockStack gap="400">
                                            <Text variant="headingMd" as="h2">Conditional Logic</Text>
                                            {!hasConditionalLogic ? (
                                                <Banner tone="info">Upgrade your plan to unlock conditional logic rules.</Banner>
                                            ) : (
                                                <Card background="bg-surface-secondary">
                                                    <Text as="p" variant="bodyMd">Condition builder goes here. (e.g. Show this field ONLY IF another field equals X).</Text>
                                                    <Button variant="primary">Add Rule</Button>
                                                </Card>
                                            )}
                                        </BlockStack>
                                    )}
                                </Box>
                            </Tabs>
                        </Card>
                    </Layout.Section>
                    
                    <Layout.Section variant="oneThird">
                        <BlockStack gap="400">
                            <Card padding="500">
                                <BlockStack gap="400">
                                    <Text variant="headingMd" as="h2">Real-time Preview</Text>
                                    <Box paddingBlockStart="200">
                                        {renderPreview()}
                                    </Box>
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </Page>
        </ShopifyLayout>
    );
};

export default CreateCustomFieldPage;
