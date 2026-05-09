import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, Store, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import Pagination from '@/components/pagination';
import shopRoutes from '@/routes/shop';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Shop {
    id: number;
    shop_domain: string;
    name: string | null;
    shop_owner_email: string | null;
    installed_at: string | null;
    uninstalled_at: string | null;
    credits: number;
    subscription: {
        id: number;
        status: string;
        charge_id: string | null;
        created_at: string;
        next_renew: string | null;
        plan: {
            name: string;
            price: string;
            currency: string;
            billing_interval: string;
        } | null;
    } | null;
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
    shops: PaginatedData<Shop>;
    filters: { search?: string; sort_field?: string; sort_direction?: string; per_page?: string };
}

const ShopIndex = ({ shops, filters }: Props) => {
    // State for filters
    const [search, setSearch] = useState(filters.search || '');
    const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
    
    // State for modal
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Trigger search when user types (with small delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                updateInertia({ search, sort_field: sortField, sort_direction: sortDirection });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Update URL with current state
    const updateInertia = (params: any) => {
        router.get(shopRoutes.index().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle sorting click
    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        updateInertia({ search, sort_field: field, sort_direction: direction });
    };
    
    const openSubscriptionDetails = (shop: Shop) => {
        setSelectedShop(shop);
        setIsModalOpen(true);
    };

    return (
        <>
            <Head title="Shops Management" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Shops
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your installed stores and their subscriptions.
                        </p>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="flex items-center max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by domain, name or email..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    {shops.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex h-[200px] flex-col items-center justify-center text-center">
                                <Store className="h-10 w-10 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No shops found matching your criteria.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="rounded-md border bg-card">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 transition-colors">
                                        <th 
                                            className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted"
                                            onClick={() => handleSort('shop_domain')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Domain {sortField === 'shop_domain' && <ArrowUpDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                        <th 
                                            className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Shop Name {sortField === 'name' && <ArrowUpDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Subscription
                                        </th>
                                        <th 
                                            className="h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted"
                                            onClick={() => handleSort('installed_at')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Install Date {sortField === 'installed_at' && <ArrowUpDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shops.data.map((shop) => (
                                        <tr
                                            key={shop.id}
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                <a href={`https://${shop.shop_domain}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                    {shop.shop_domain}
                                                </a>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {shop.name || 'N/A'}
                                                {shop.shop_owner_email && (
                                                    <div className="text-xs text-muted-foreground">{shop.shop_owner_email}</div>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {shop.subscription ? (
                                                    <Badge 
                                                        variant={shop.subscription.status === 'ACTIVE' ? 'default' : 'secondary'} 
                                                        className={`cursor-pointer ${shop.subscription.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                                        onClick={() => openSubscriptionDetails(shop)}
                                                    >
                                                        {shop.subscription.plan?.name || 'Unknown'} ({shop.subscription.status})
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">Free</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {shop.installed_at ? new Date(shop.installed_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {!shop.uninstalled_at ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                        Installed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                                        Uninstalled
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Pagination */}
                            <div className="p-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium">{shops.from || 0}</span> to <span className="font-medium">{shops.to || 0}</span> of <span className="font-medium">{shops.total}</span> results
                                </div>
                                <Pagination links={shops.links} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Subscription Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subscription Details</DialogTitle>
                        <DialogDescription>
                            {selectedShop?.shop_domain}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedShop?.subscription ? (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-semibold text-right">Plan:</span>
                                <span className="col-span-3">{selectedShop.subscription.plan?.name || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-semibold text-right">Status:</span>
                                <span className="col-span-3">
                                    <Badge variant={selectedShop.subscription.status === 'ACTIVE' ? 'default' : 'secondary'} className={selectedShop.subscription.status === 'ACTIVE' ? 'bg-green-500' : ''}>
                                        {selectedShop.subscription.status}
                                    </Badge>
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-semibold text-right">Price:</span>
                                <span className="col-span-3">
                                    {selectedShop.subscription.plan?.price} {selectedShop.subscription.plan?.currency} / {selectedShop.subscription.plan?.billing_interval?.toLowerCase().replace('_', ' ')}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-semibold text-right">Charge ID:</span>
                                <span className="col-span-3 font-mono text-sm">{selectedShop.subscription.charge_id || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-semibold text-right">Created:</span>
                                <span className="col-span-3">
                                    {new Date(selectedShop.subscription.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-semibold text-right">Next Renew:</span>
                                <span className="col-span-3">
                                    {selectedShop.subscription.next_renew ? new Date(selectedShop.subscription.next_renew).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 text-center text-muted-foreground">
                            No subscription details found.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ShopIndex;
