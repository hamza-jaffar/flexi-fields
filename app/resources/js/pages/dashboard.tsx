import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    CreditCard, 
    Layers, 
    TrendingUp, 
    Store,
    Calendar,
    ArrowUpRight,
    Activity,
    DollarSign,
    Percent
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';

interface Props {
    stats: {
        total_shops: number;
        active_subscriptions: number;
        total_fields: number;
        monthly_revenue: number;
        yearly_revenue: number;
        retention_rate: number;
    };
    recentShops: any[];
}

export default function Dashboard({ stats, recentShops }: Props) {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <Head title="Admin Dashboard" />
            
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Platform Dashboard</h2>
                    <p className="text-muted-foreground">
                        Comprehensive overview of your application's performance and growth.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline">Download Report</Button>
                    <Button>Refresh Data</Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_shops}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.retention_rate}% retention rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Created Fields</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_fields}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all connected stores
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${parseFloat(stats.monthly_revenue.toString()).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Estimated recurring revenue
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest store installations and plan updates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentShops.map((shop) => (
                                <div key={shop.id} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 uppercase font-bold text-slate-600">
                                        {shop.name.charAt(0)}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{shop.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {shop.shop_domain}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-4">
                                        <Badge variant={shop.subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {shop.subscription?.plan?.name || 'Free'}
                                        </Badge>
                                        <p className="text-sm font-medium hidden sm:block">
                                            {new Date(shop.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Business Insights */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Business Insights</CardTitle>
                        <CardDescription>
                            Key performance indicators.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Projected Annual Revenue</span>
                                <span className="font-bold text-green-600">${parseFloat(stats.yearly_revenue.toString()).toLocaleString()}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-green-500 w-[65%]"></div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Conversion</p>
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-500" />
                                    <span className="text-lg font-bold">12.5%</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Churn Rate</p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                                    <span className="text-lg font-bold">2.1%</span>
                                </div>
                            </div>
                        </div>

                        <Card className="bg-slate-50 border-none">
                            <CardContent className="p-4 space-y-2">
                                <p className="text-sm font-bold">Growth Strategy</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Convert the {recentShops.filter(s => !s.subscription).length} stores currently on the free tier to increase MRR by 15%.
                                </p>
                                <Button variant="link" className="p-0 h-auto text-blue-600 font-bold" asChild>
                                    <Link href="/plan">Manage Plans <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
