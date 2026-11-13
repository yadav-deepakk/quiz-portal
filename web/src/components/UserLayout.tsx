import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Category } from "../types";
import { Spinner } from "./Spinner";

export function UserLayout() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        let active = true;

        api
            .get<Category[]>("/category")
            .then((data) => {
                if (active) {
                    setCategories(Array.isArray(data) ? data : []);
                }
            })
            .catch(() => {
                if (active) {
                    showToast("Unable to load categories.", "error");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [showToast]);

    return (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <aside>
                <div className="card p-3 lg:sticky lg:top-24">
                    <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Categories
                    </p>
                    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
                        <NavLink
                            to="/user/quizzes/0"
                            className={({ isActive }) => `sidebar-link whitespace-nowrap ${isActive ? "sidebar-link-active" : ""}`}
                        >
                            All quizzes
                        </NavLink>
                        {loading && <span className="px-3 py-2 text-sm text-slate-400">Loading...</span>}
                        {!loading &&
                            categories.map((category) => (
                                <NavLink
                                    key={category.categoryId}
                                    to={`/user/quizzes/${category.categoryId}`}
                                    className={({ isActive }) =>
                                        `sidebar-link whitespace-nowrap ${isActive ? "sidebar-link-active" : ""}`
                                    }
                                >
                                    {category.categoryTitle}
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
