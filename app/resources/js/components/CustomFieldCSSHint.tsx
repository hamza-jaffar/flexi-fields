import React from 'react';
import { Text } from '@shopify/polaris';

interface CustomFieldCSSHintProps {
    data: any;
    fieldId?: string | number;
}

const CustomFieldCSSHint: React.FC<CustomFieldCSSHintProps> = ({
    data,
    fieldId,
}) => {
    const id = fieldId || 'new';
    const inputTag =
        data.type === 'textarea'
            ? 'textarea'
            : data.type === 'select'
              ? 'select'
              : 'input';
    const inputLabel =
        data.type === 'textarea'
            ? 'textarea'
            : data.type === 'select'
              ? 'dropdown'
              : 'input';

    return (
        <Text variant="bodySm" tone="subdued" as="p">
            <strong>Auto-Scoped CSS:</strong> Any CSS you write here will
            automatically only apply to this specific field.
            <br />
            <br />
            <strong>Common targets:</strong>
            <ul
                style={{
                    listStyle: 'disc',
                    paddingLeft: '20px',
                    marginTop: '8px',
                }}
            >
                <li>
                    <code>.flexi-field-label</code> - The field label
                </li>
                <li>
                    <code>{inputTag}</code> - The actual {inputLabel}
                </li>
                {data.help_text && (
                    <li>
                        <code>.flexi-field-help</code> - The help text
                    </li>
                )}
                {(data.type === 'file_upload' || data.type === 'file') && (
                    <li>
                        <code>.flexi-field-file-dropzone</code> - The upload box
                    </li>
                )}
            </ul>
        </Text>
    );
};

export default CustomFieldCSSHint;
