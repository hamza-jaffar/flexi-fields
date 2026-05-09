import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import planRoutes from '@/routes/plan';
import { Button } from '@/components/ui/button';

interface Plan {
    id: number;
    name: string;
    handle: string;
    price: string;
    currency: string;
    billing_interval: string;
    trial_days: number;
    is_active: boolean;
    is_featured: boolean;
}

interface Props {
    plans: Plan[];
}

const PlanIndex = ({ plans }: Props) => {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            destroy(planRoutes.destroy(id).url);
        }
    };

    return (
        <>
            <Head title="Plans Management" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Plans
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your subscription plans and pricing.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={planRoutes.create().url}>
                            <Plus className="mr-2 h-4 w-4" /> Add Plan
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4">
                    {plans.length === 0 ? (
                        <Card>
                            <CardContent className="flex h-[200px] flex-col items-center justify-center text-center">
                                <p className="text-muted-foreground">
                                    No plans found. Create your first plan to
                                    get started.
                                </p>
                                <Button variant="link" asChild>
                                    <Link href={planRoutes.create().url}>
                                        Create Plan
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 transition-colors">
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Name
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Handle
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Price
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Interval
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Status
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.map((plan) => (
                                        <tr
                                            key={plan.id}
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                {plan.name}
                                                {plan.is_featured && (
                                                    <Badge
                                                        className="ml-2"
                                                        variant="secondary"
                                                    >
                                                        Featured
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {plan.handle}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {plan.price} {plan.currency}
                                            </td>
                                            <td className="p-4 align-middle capitalize">
                                                {plan.billing_interval
                                                    .toLowerCase()
                                                    .replace(/_/g, ' ')}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {plan.is_active ? (
                                                    <Badge
                                                        variant="default"
                                                        className="bg-green-500 hover:bg-green-600"
                                                    >
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <XCircle className="mr-1 h-3 w-3" />{' '}
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-right align-middle">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={
                                                                planRoutes.edit(
                                                                    plan.id,
                                                                ).url
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                plan.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PlanIndex;
