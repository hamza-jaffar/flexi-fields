import { Link } from '@inertiajs/react';

interface PaginationProps {
    links: { url: string | null; label: string; active: boolean }[];
}

const Pagination = ({ links }: PaginationProps) => {
    if (links.length <= 3) return null; // Only Previous, 1, Next

    return (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
            {links.map((link, index) => {
                const label = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»');

                return link.url === null ? (
                    <div
                        key={index}
                        className="cursor-not-allowed rounded border bg-gray-50 px-4 py-2 text-sm text-gray-500 opacity-50"
                    >
                        {label}
                    </div>
                ) : (
                    <Link
                        key={index}
                        href={link.url}
                        className={`rounded border px-4 py-2 text-sm transition-colors hover:bg-gray-100 ${
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-white text-gray-700'
                        }`}
                        preserveScroll
                        preserveState
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
};

export default Pagination;
