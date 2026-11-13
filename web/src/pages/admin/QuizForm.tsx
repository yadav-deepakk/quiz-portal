import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { Category, Quiz } from "../../types";

const emptyQuiz: Quiz = {
    quizTitle: "",
    quizDescription: "",
    questionCount: undefined,
    quizMaxMarks: undefined,
    isActiveQuiz: false,
    category: {},
};

export function QuizForm() {
    const { quizId } = useParams();
    const isEdit = Boolean(quizId);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [quiz, setQuiz] = useState<Quiz>(emptyQuiz);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);

        const quizRequest = quizId ? api.get<Quiz>(`/quiz/${quizId}`) : Promise.resolve(emptyQuiz);
        const categoriesRequest = api.get<Category[]>("/category");

        Promise.all([quizRequest, categoriesRequest])
            .then(([quizData, categoryData]) => {
                if (!active) {
                    return;
                }
                setQuiz(quizData);
                setCategories(Array.isArray(categoryData) ? categoryData : []);
            })
            .catch(() => {
                if (active) {
                    showToast("Unable to load the quiz data.", "error");
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
    }, [quizId, showToast]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const title = quiz.quizTitle?.trim() ?? "";
        if (!title) {
            showToast("Please enter a quiz title.", "error");
            return;
        }

        if (title.length > 1000) {
            showToast("Quiz title can be at most 1000 characters.", "error");
            return;
        }

        if ((quiz.quizDescription?.trim().length ?? 0) > 3000) {
            showToast("Quiz description can be at most 3000 characters.", "error");
            return;
        }

        if (!quiz.category?.categoryId) {
            showToast("Please select a category.", "error");
            return;
        }

        const payload: Quiz = {
            ...quiz,
            quizTitle: title,
            questionCount: Number(quiz.questionCount ?? 0),
            quizMaxMarks: Number(quiz.quizMaxMarks ?? 0),
            category: { categoryId: quiz.category.categoryId },
        };

        setSubmitting(true);
        try {
            if (isEdit) {
                await api.put<Quiz>("/quiz", payload);
                showToast("Quiz updated.", "success");
            } else {
                await api.post<Quiz>("/quiz", payload);
                showToast("Quiz created.", "success");
            }
            navigate("/admin/quiz");
        } catch {
            showToast(`Unable to ${isEdit ? "update" : "create"} the quiz.`, "error");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <Spinner label="Loading quiz..." />;
    }

    return (
        <div className="max-w-2xl">
            <PageHeader
                title={isEdit ? "Update quiz" : "Add a quiz"}
                subtitle={isEdit ? "Edit the quiz details below." : "Create a quiz, then add questions to it."}
            />

            <form onSubmit={handleSubmit} className="card card-body">
                <div className="field">
                    <label className="label" htmlFor="quizTitle">
                        Quiz title
                    </label>
                    <input
                        id="quizTitle"
                        className="input"
                        value={quiz.quizTitle ?? ""}
                        onChange={(event) => setQuiz((current) => ({ ...current, quizTitle: event.target.value }))}
                        placeholder="Enter quiz title"
                        required
                    />
                </div>

                <div className="field">
                    <label className="label" htmlFor="quizDescription">
                        Description <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                        id="quizDescription"
                        className="input min-h-28"
                        rows={4}
                        value={quiz.quizDescription ?? ""}
                        onChange={(event) =>
                            setQuiz((current) => ({ ...current, quizDescription: event.target.value }))
                        }
                        placeholder="Describe the quiz"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="field">
                        <label className="label" htmlFor="questionCount">
                            Questions
                        </label>
                        <input
                            id="questionCount"
                            type="number"
                            min={1}
                            className="input"
                            value={quiz.questionCount ?? ""}
                            onChange={(event) =>
                                setQuiz((current) => ({
                                    ...current,
                                    questionCount: event.target.value === "" ? undefined : Number(event.target.value),
                                }))
                            }
                            placeholder="Number of questions"
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="quizMaxMarks">
                            Total marks
                        </label>
                        <input
                            id="quizMaxMarks"
                            type="number"
                            min={1}
                            className="input"
                            value={quiz.quizMaxMarks ?? ""}
                            onChange={(event) =>
                                setQuiz((current) => ({
                                    ...current,
                                    quizMaxMarks: event.target.value === "" ? undefined : Number(event.target.value),
                                }))
                            }
                            placeholder="Maximum marks"
                            required
                        />
                    </div>
                </div>

                <div className="field">
                    <label className="label" htmlFor="categoryId">
                        Category
                    </label>
                    <select
                        id="categoryId"
                        className="input"
                        value={quiz.category?.categoryId ?? ""}
                        onChange={(event) =>
                            setQuiz((current) => ({
                                ...current,
                                category: { categoryId: Number(event.target.value) },
                            }))
                        }
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                                {category.categoryTitle}
                            </option>
                        ))}
                    </select>
                </div>

                <label className="mb-5 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        checked={Boolean(quiz.isActiveQuiz)}
                        onChange={(event) =>
                            setQuiz((current) => ({ ...current, isActiveQuiz: event.target.checked }))
                        }
                    />
                    Publish this quiz
                </label>

                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
                    </button>
                    <Link to="/admin/quiz" className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
