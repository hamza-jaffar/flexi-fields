import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import planRoutes from '@/routes/plan';

interface FeatureDef {
    key: string;
    label: string;
    type: 'boolean' | 'limit';
    input: 'toggle' | 'number';
    default: any;
    description: string;
}

interface GroupedFeatures {
    [groupName: string]: FeatureDef[];
}

interface Plan {
    id: number;
    name: string;
    handle: string;
    price: string | number;
    discounted_price: string | number | null;
    currency: string;
    billing_interval: string;
    trial_days: number;
    is_active: boolean;
    is_featured: boolean;
    internal_features: any;
    display_features: any;
    button_text: string;
}

interface Props {
    plan: Plan;
    groupedFeatures: GroupedFeatures;
}

const PlanEdit = ({ plan, groupedFeatures }: Props) => {
    // Generate initial normalized values by combining DB values and enum defaults
    const getInitialInternalFeatures = () => {
        const existingFeatures = Array.isArray(plan.internal_features) 
            ? plan.internal_features 
            : [];
            
        // Convert the old format or fill missing fields with defaults
        return Object.values(groupedFeatures).flat().map(feature => {
            const existing = existingFeatures.find((f: any) => f.feature_key === feature.key);
            
            return {
                feature_key: feature.key,
                feature_type: feature.type,
                feature_value: existing !== undefined ? existing.feature_value : feature.default
            };
        });
    };

    const { data, setData, put, processing, errors } = useForm({
        name: plan.name,
        handle: plan.handle,
        price: plan.price.toString(),
        discounted_price: plan.discounted_price?.toString() || '',
        currency: plan.currency,
        billing_interval: plan.billing_interval,
        trial_days: plan.trial_days,
        is_active: plan.is_active,
        is_featured: plan.is_featured,
        internal_features: getInitialInternalFeatures(),
        display_features: Array.isArray(plan.display_features)
            ? plan.display_features
            : [''],
        button_text: plan.button_text || 'Start Free Trial',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(planRoutes.update(plan.id).url);
    };

    const addDisplayFeature = () => {
        setData('display_features', [...data.display_features, '']);
    };

    const removeDisplayFeature = (index: number) => {
        const newFeatures = [...data.display_features];
        newFeatures.splice(index, 1);
        setData('display_features', newFeatures);
    };

    const updateDisplayFeature = (index: number, value: string) => {
        const newFeatures = [...data.display_features];
        newFeatures[index] = value;
        setData('display_features', newFeatures);
    };

    const updateInternalFeature = (key: string, value: any) => {
        const newFeatures = [...data.internal_features];
        const featureIndex = newFeatures.findIndex(f => f.feature_key === key);
        if (featureIndex >= 0) {
            newFeatures[featureIndex].feature_value = value;
            setData('internal_features', newFeatures);
        }
    };

    const getFeatureValue = (key: string) => {
        return data.internal_features.find((f: any) => f.feature_key === key)?.feature_value;
    };

    return (
        <>
            <Head title={`Edit Plan - ${plan.name}`} />
            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="link" size="icon" asChild>
                        <Link href={planRoutes.index().url}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Plan: {plan.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Modify the details of your subscription tier.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Main details about the plan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Plan Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g. Basic Plan"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="handle">
                                        Handle (Unique Identifier)
                                    </Label>
                                    <Input
                                        id="handle"
                                        value={data.handle}
                                        onChange={(e) =>
                                            setData('handle', e.target.value)
                                        }
                                        placeholder="e.g. basic-plan"
                                    />
                                    {errors.handle && (
                                        <p className="text-sm text-destructive">
                                            {errors.handle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData('price', e.target.value)
                                        }
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="discounted_price">
                                        Discounted Price (Optional)
                                    </Label>
                                    <Input
                                        id="discounted_price"
                                        type="number"
                                        step="0.01"
                                        value={data.discounted_price}
                                        onChange={(e) =>
                                            setData(
                                                'discounted_price',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.discounted_price && (
                                        <p className="text-sm text-destructive">
                                            {errors.discounted_price}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input
                                        id="currency"
                                        value={data.currency}
                                        onChange={(e) =>
                                            setData(
                                                'currency',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        maxLength={3}
                                    />
                                    {errors.currency && (
                                        <p className="text-sm text-destructive">
                                            {errors.currency}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="billing_interval">
                                        Billing Interval
                                    </Label>
                                    <Select
                                        value={data.billing_interval}
                                        onValueChange={(value) =>
                                            setData('billing_interval', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select interval" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ONE_TIME">
                                                One Time
                                            </SelectItem>
                                            <SelectItem value="EVERY_30_DAYS">
                                                Monthly (30 Days)
                                            </SelectItem>
                                            <SelectItem value="EVERY_6_MONTHS">
                                                Every 6 Months
                                            </SelectItem>
                                            <SelectItem value="EVERY_12_MONTHS">
                                                Yearly (12 Months)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.billing_interval && (
                                        <p className="text-sm text-destructive">
                                            {errors.billing_interval}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="trial_days">
                                        Trial Days
                                    </Label>
                                    <Input
                                        id="trial_days"
                                        type="number"
                                        value={data.trial_days}
                                        onChange={(e) =>
                                            setData(
                                                'trial_days',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                    {errors.trial_days && (
                                        <p className="text-sm text-destructive">
                                            {errors.trial_days}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Display Settings</CardTitle>
                            <CardDescription>
                                Configure frontend visibility and public features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="button_text">Call to Action Button Text</Label>
                                <Input
                                    id="button_text"
                                    value={data.button_text}
                                    onChange={(e) =>
                                        setData('button_text', e.target.value)
                                    }
                                />
                                {errors.button_text && (
                                    <p className="text-sm text-destructive">
                                        {errors.button_text}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4">
                                <Label>
                                    Display Features (Shown on pricing table)
                                </Label>
                                {data.display_features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) =>
                                                updateDisplayFeature(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Unlimited Fields"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            onClick={() =>
                                                removeDisplayFeature(index)
                                            }
                                            disabled={
                                                data.display_features.length ===
                                                1
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="w-fit"
                                    onClick={addDisplayFeature}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                    Display Feature
                                </Button>
                            </div>

                            <div className="flex gap-6 mt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData('is_active', !!checked)
                                        }
                                    />
                                    <Label htmlFor="is_active">Is Active</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) =>
                                            setData('is_featured', !!checked)
                                        }
                                    />
                                    <Label htmlFor="is_featured">
                                        Is Featured (Highlighted on pricing page)
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dynamic Feature Groups */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {Object.entries(groupedFeatures).map(([groupName, features]) => (
                            <Card key={groupName} className="h-fit">
                                <CardHeader>
                                    <CardTitle>{groupName}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    {features.map((feature) => (
                                        <div key={feature.key} className="flex flex-col gap-2">
                                            {feature.input === 'toggle' ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col gap-1 pr-4">
                                                        <Label htmlFor={`feature-${feature.key}`}>{feature.label}</Label>
                                                        <span className="text-xs text-muted-foreground">{feature.description}</span>
                                                    </div>
                                                    <Switch
                                                        id={`feature-${feature.key}`}
                                                        checked={!!getFeatureValue(feature.key)}
                                                        onCheckedChange={(checked) => updateInternalFeature(feature.key, checked)}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="grid gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <Label htmlFor={`feature-${feature.key}`}>{feature.label}</Label>
                                                        <span className="text-xs text-muted-foreground">{feature.description}</span>
                                                    </div>
                                                    <Input
                                                        id={`feature-${feature.key}`}
                                                        type="number"
                                                        value={getFeatureValue(feature.key) ?? ''}
                                                        onChange={(e) => updateInternalFeature(feature.key, parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="sticky bottom-0 bg-background/90 p-4 border-t flex justify-end gap-4 z-10">
                        <Button variant="link" asChild type="button">
                            <Link href={planRoutes.index().url}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Plan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PlanEdit;
