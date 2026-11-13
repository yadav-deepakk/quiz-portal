import type { ReactNode } from "react";

export function PageHeader({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
    return (
        <div className="card card-body text-center">
            <p className="font-semibold text-slate-700">{title}</p>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
    );
}
