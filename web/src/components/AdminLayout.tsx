import { NavLink, Outlet } from "react-router-dom";

const links = [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/profile", label: "Profile" },
    { to: "/admin/category", label: "Categories" },
    { to: "/admin/add-category", label: "Add category" },
    { to: "/admin/quiz", label: "Quizzes" },
    { to: "/admin/add-quiz", label: "Add quiz" },
];

export function AdminLayout() {
    return (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <aside>
                <div className="card p-3 lg:sticky lg:top-24">
                    <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Admin menu
                    </p>
                    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) =>
                                    `sidebar-link whitespace-nowrap ${isActive ? "sidebar-link-active" : ""}`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
            <section className="min-w-0">
                <Outlet />
            </section>
        </div>
    );
}
