import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState, PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { Category } from "../../types";

export function Categories() {
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

    async function deleteCategory(category: Category) {
        if (!category.categoryId) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${category.categoryTitle}"? This action cannot be undone.`
        );
        if (!confirmed) {
            return;
        }

        try {
            await api.delete<boolean>(`/category/${category.categoryId}`);
            setCategories((current) => current.filter((item) => item.categoryId !== category.categoryId));
            showToast("Category deleted.", "success");
        } catch {
            showToast("Unable to delete the category.", "error");
        }
    }

    return (
        <div>
            <PageHeader
                title="Categories"
                subtitle="All categories used to organise quizzes."
                action={
                    <Link to="/admin/add-category" className="btn-primary">
                        Add category
                    </Link>
                }
            />

            {loading && <Spinner label="Loading categories..." />}

            {!loading && categories.length === 0 && (
                <EmptyState title="No categories yet." description="Create a category before adding a quiz." />
            )}

            <div className="space-y-3">
                {categories.map((category) => (
                    <article key={category.categoryId} className="card card-body flex flex-wrap items-center gap-4">
                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-slate-900">{category.categoryTitle}</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {category.categoryDescription || "No description provided."}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/admin/category/${category.categoryId}`} className="btn-secondary">
                                Update
                            </Link>
                            <button type="button" onClick={() => deleteCategory(category)} className="btn-danger">
                                Delete
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
