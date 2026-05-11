import React from 'react';
import { Box, BlockStack, Text } from '@shopify/polaris';

interface CustomFieldPreviewProps {
    data: any;
    fieldId?: string | number;
}

const dawnStyles = `
    .flexi-field-wrapper {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #121212;
    }
    .flexi-field-label {
        display: block;
        font-size: 14px;
        margin-bottom: 8px;
        color: rgba(18, 18, 18, 0.75);
    }
    .flexi-field-input {
        width: 100%;
        padding: 12px;
        border: 1px solid rgba(18, 18, 18, 0.1);
        border-radius: 4px;
        font-size: 16px;
        background: #fff;
    }
    .flexi-field-help {
        font-size: 12px;
        color: rgba(18, 18, 18, 0.6);
        margin-top: 4px;
    }
    .dawn-preview-dropzone {
        border: 2px dashed rgba(18, 18, 18, 0.1);
        border-radius: 4px;
        padding: 30px;
        text-align: center;
        background: rgba(18, 18, 18, 0.02);
    }
    .dawn-preview-dropzone .upload-icon {
        font-size: 24px;
        color: #ccc;
    }
    .dawn-preview-dropzone .upload-text {
        font-size: 14px;
        color: #666;
    }
`;

const CustomFieldPreview: React.FC<CustomFieldPreviewProps> = ({ data, fieldId }) => {
    const id = fieldId || 'new';
    
    return (
        <Box>
            <style>{dawnStyles}</style>
            {data.settings?.custom_css && (
                <style>
                    {`#flexi-field-${id} { ${data.settings.custom_css} }`}
                </style>
            )}
            <div
                id={`flexi-field-${id}`}
                className={`flexi-field-wrapper custom-field flexi-field-${id}`}
                style={{
                    padding: '24px',
                    border: '1px solid #e1e1e1',
                    borderRadius: '8px',
                    background: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
            >
                {/* Mock Storefront Header */}
                <Box paddingBlockEnd="400">
                    <Text variant="headingSm" as="h3" tone="subdued">
                        STOREFRONT PREVIEW
                    </Text>
                </Box>

                <BlockStack gap="400">
                    <BlockStack gap="100">
                        <label className="flexi-field-label">
                            {data.label || 'Field Label'}{' '}
                            {data.is_required && (
                                <span style={{ color: '#d72c0d' }}>*</span>
                            )}
                            {data.has_price_addon && data.price > 0 && (
                                <span style={{ marginLeft: '4px', fontSize: '0.9em', color: '#666' }}>
                                    (+${data.price})
                                </span>
                            )}
                        </label>

                        {data.type === 'text' && (
                            <input
                                type="text"
                                placeholder={data.placeholder}
                                className="flexi-field-input"
                                readOnly
                            />
                        )}
                        {data.type === 'textarea' && (
                            <textarea
                                placeholder={data.placeholder}
                                className="flexi-field-input"
                                style={{ minHeight: '80px' }}
                                readOnly
                            />
                        )}
                        {data.type === 'number' && (
                            <input
                                type="number"
                                placeholder={data.placeholder}
                                className="flexi-field-input"
                                readOnly
                            />
                        )}
                        {data.type === 'select' && (
                            <select className="flexi-field-input">
                                {data.options && data.options.length > 0 ? (
                                    data.options.map((opt: any, i: number) => (
                                        <option key={i} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))
                                ) : (
                                    <option>Example Option</option>
                                )}
                            </select>
                        )}
                        {(data.type === 'checkbox' || data.type === 'checkbox_group') && (
                            <div className="mt-2 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    style={{ width: '18px', height: '18px' }}
                                    readOnly
                                />
                                <span style={{ fontSize: '14px' }}>
                                    {data.label || 'Option Label'}
                                </span>
                            </div>
                        )}
                        {data.type === 'color_swatch' && (
                            <div className="mt-2 flex flex-wrap gap-3">
                                {data.options && data.options.length > 0 ? (
                                    data.options.map((opt: any, i: number) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: opt.value?.match(/^#([0-9a-f]{3}){1,2}$/i) ? opt.value : '#ccc',
                                                border: '2px solid #e1e1e1',
                                                boxShadow: 'inset 0 0 0 2px #fff',
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#000', border: '2px solid #e1e1e1' }} />
                                )}
                            </div>
                        )}
                        {data.type === 'file_upload' && (
                            <div className="dawn-preview-dropzone">
                                <div className="upload-icon">+</div>
                                <div className="upload-text">Upload your file here</div>
                            </div>
                        )}
                        {data.type === 'date_picker' && (
                            <input
                                type="date"
                                className="flexi-field-input"
                                readOnly
                            />
                        )}

                        {data.help_text && (
                            <p className="flexi-field-help">
                                {data.help_text}
                            </p>
                        )}
                    </BlockStack>
                </BlockStack>
            </div>
        </Box>
    );
};

export default CustomFieldPreview;
