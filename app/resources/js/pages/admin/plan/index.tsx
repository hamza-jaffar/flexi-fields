import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    Search,
    ArrowUpDown,
} from 'lucide-react';
import planRoutes from '@/routes/plan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import Pagination from '@/components/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface Props {
    plans: PaginatedData<Plan>;
    filters: {
        search?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: string;
    };
}

const PlanIndex = ({ plans, filters }: Props) => {
    const { delete: destroy } = useForm();

    // State for filters
    const [search, setSearch] = useState(filters.search || '');
    const [sortField, setSortField] = useState(
        filters.sort_field || 'created_at',
    );
    const [sortDirection, setSortDirection] = useState(
        filters.sort_direction || 'desc',
    );
    
    // State for delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<number | null>(null);

    const confirmDelete = (id: number) => {
        setPlanToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (planToDelete !== null) {
            destroy(planRoutes.destroy(planToDelete).url, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setPlanToDelete(null);
                }
            });
        }
    };

    // Trigger search when user types (with small delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                updateInertia({
                    search,
                    sort_field: sortField,
                    sort_direction: sortDirection,
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Update URL with current state
    const updateInertia = (params: any) => {
        router.get(planRoutes.index().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle sorting click
    const handleSort = (field: string) => {
        const direction =
            sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        updateInertia({ search, sort_field: field, sort_direction: direction });
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

                {/* Search Bar */}
                <div className="flex max-w-sm items-center">
                    <div className="relative w-full">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search plans..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    {plans.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex h-[200px] flex-col items-center justify-center text-center">
                                <p className="text-muted-foreground">
                                    No plans found.
                                </p>
                                {search === '' && (
                                    <Button variant="link" asChild>
                                        <Link href={planRoutes.create().url}>
                                            Create Plan
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="rounded-md border bg-card">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 transition-colors">
                                        <th
                                            className="h-12 cursor-pointer px-4 text-left align-middle font-medium hover:bg-muted"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Name{' '}
                                                {sortField === 'name' && (
                                                    <ArrowUpDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="h-12 cursor-pointer px-4 text-left align-middle font-medium hover:bg-muted"
                                            onClick={() => handleSort('handle')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Handle{' '}
                                                {sortField === 'handle' && (
                                                    <ArrowUpDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="h-12 cursor-pointer px-4 text-left align-middle font-medium hover:bg-muted"
                                            onClick={() => handleSort('price')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Price{' '}
                                                {sortField === 'price' && (
                                                    <ArrowUpDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Interval
                                        </th>
                                        <th
                                            className="h-12 cursor-pointer px-4 text-left align-middle font-medium hover:bg-muted"
                                            onClick={() =>
                                                handleSort('is_active')
                                            }
                                        >
                                            <div className="flex items-center gap-1">
                                                Status{' '}
                                                {sortField === 'is_active' && (
                                                    <ArrowUpDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.data.map((plan) => (
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
                                                            confirmDelete(
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

                            {/* Pagination */}
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-border p-4 md:flex-row">
                                <div className="text-sm text-muted-foreground">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {plans.from || 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {plans.to || 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">
                                        {plans.total}
                                    </span>{' '}
                                    results
                                </div>
                                <Pagination links={plans.links} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Plan</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this plan? This action cannot be undone and may affect active subscriptions.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PlanIndex;
