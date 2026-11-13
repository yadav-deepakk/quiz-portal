import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { Category } from "../../types";

const emptyCategory: Category = {
    categoryTitle: "",
    categoryDescription: "",
};

export function CategoryForm() {
    const { categoryId } = useParams();
    const isEdit = Boolean(categoryId);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [category, setCategory] = useState<Category>(emptyCategory);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!categoryId) {
            setCategory(emptyCategory);
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        api
            .get<Category>(`/category/${categoryId}`)
            .then((data) => {
                if (active) {
                    setCategory(data);
                }
            })
            .catch(() => {
                if (active) {
                    showToast("Unable to load the category.", "error");
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
    }, [categoryId, showToast]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!category.categoryTitle?.trim()) {
            showToast("Please enter a category title.", "error");
            return;
        }

        if (category.categoryTitle.trim().length > 1000) {
            showToast("Category title can be at most 1000 characters.", "error");
            return;
        }

        if ((category.categoryDescription?.trim().length ?? 0) > 2500) {
            showToast("Category description can be at most 2500 characters.", "error");
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                await api.put<Category>("/category", category);
                showToast("Category updated.", "success");
            } else {
                await api.post<Category>("/category", category);
                showToast("Category created.", "success");
            }
            navigate("/admin/category");
        } catch {
            showToast(`Unable to ${isEdit ? "update" : "create"} the category.`, "error");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <Spinner label="Loading category..." />;
    }

    return (
        <div className="max-w-2xl">
            <PageHeader
                title={isEdit ? "Update category" : "Add a category"}
                subtitle={isEdit ? "Edit the category details below." : "Group related quizzes under a new category."}
            />

            <form onSubmit={handleSubmit} className="card card-body">
                <div className="field">
                    <label className="label" htmlFor="categoryTitle">
                        Title
                    </label>
                    <input
                        id="categoryTitle"
                        className="input"
                        value={category.categoryTitle ?? ""}
                        onChange={(event) =>
                            setCategory((current) => ({ ...current, categoryTitle: event.target.value }))
                        }
                        placeholder="Enter category title"
                        required
                    />
                </div>

                <div className="field">
                    <label className="label" htmlFor="categoryDescription">
                        Description <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                        id="categoryDescription"
                        className="input min-h-28"
                        rows={5}
                        value={category.categoryDescription ?? ""}
                        onChange={(event) =>
                            setCategory((current) => ({ ...current, categoryDescription: event.target.value }))
                        }
                        placeholder="Describe the category"
                    />
                </div>

                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
                    </button>
                    <Link to="/admin/category" className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
