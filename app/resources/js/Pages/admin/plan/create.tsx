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
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import planRoutes from '@/routes/plan';

const PlanCreate = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        handle: '',
        price: '0',
        discounted_price: '',
        currency: 'USD',
        billing_interval: 'EVERY_30_DAYS',
        trial_days: 0,
        is_active: true,
        is_featured: false,
        internal_features: [''],
        display_features: [''],
        button_text: 'Start Free Trial',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(planRoutes.store().url);
    };

    const addFeature = (type: 'internal' | 'display') => {
        const field =
            type === 'internal' ? 'internal_features' : 'display_features';
        setData(field, [...data[field], '']);
    };

    const removeFeature = (type: 'internal' | 'display', index: number) => {
        const field =
            type === 'internal' ? 'internal_features' : 'display_features';
        const newFeatures = [...data[field]];
        newFeatures.splice(index, 1);
        setData(field, newFeatures);
    };

    const updateFeature = (
        type: 'internal' | 'display',
        index: number,
        value: string,
    ) => {
        const field =
            type === 'internal' ? 'internal_features' : 'display_features';
        const newFeatures = [...data[field]];
        newFeatures[index] = value;
        setData(field, newFeatures);
    };

    return (
        <>
            <Head title="Create Plan" />
            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="link" size="icon" asChild>
                        <Link href={planRoutes.index().url}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Create Plan
                        </h1>
                        <p className="text-muted-foreground">
                            Define a new subscription tier for your merchants.
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
                            <CardTitle>Features & Settings</CardTitle>
                            <CardDescription>
                                Configure features and visibility.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-4">
                                <Label>
                                    Display Features (Shown on pricing table)
                                </Label>
                                {data.display_features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) =>
                                                updateFeature(
                                                    'display',
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Unlimited Fields"
                                        />
                                        <Button
                                            size="icon"
                                            onClick={() =>
                                                removeFeature('display', index)
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
                                    onClick={() => addFeature('display')}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                    Display Feature
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                <Label>
                                    Internal Features (Technical limits/configs)
                                </Label>
                                {data.internal_features.map(
                                    (feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={feature}
                                                onChange={(e) =>
                                                    updateFeature(
                                                        'internal',
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. max_fields: 10"
                                            />
                                            <Button
                                                size="icon"
                                                onClick={() =>
                                                    removeFeature(
                                                        'internal',
                                                        index,
                                                    )
                                                }
                                                disabled={
                                                    data.internal_features
                                                        .length === 1
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ),
                                )}
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="w-fit"
                                    onClick={() => addFeature('internal')}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                    Internal Feature
                                </Button>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="button_text">Button Text</Label>
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

                            <div className="flex gap-6">
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
                                        Is Featured (Highlighted UI)
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="link" asChild>
                            <Link href={planRoutes.index().url}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Plan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PlanCreate;
