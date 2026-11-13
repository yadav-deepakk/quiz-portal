import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState, PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { Quiz } from "../../types";

export function Quizzes() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        let active = true;

        api
            .get<Quiz[]>("/quiz")
            .then((data) => {
                if (active) {
                    setQuizzes(Array.isArray(data) ? data : []);
                }
            })
            .catch(() => {
                if (active) {
                    showToast("Unable to load quizzes.", "error");
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

    async function deleteQuiz(quiz: Quiz) {
        if (!quiz.quizId) {
            return;
        }

        if (!window.confirm(`Delete "${quiz.quizTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete<boolean>(`/quiz/${quiz.quizId}`);
            setQuizzes((current) => current.filter((item) => item.quizId !== quiz.quizId));
            showToast("Quiz deleted.", "success");
        } catch {
            showToast("Unable to delete the quiz.", "error");
        }
    }

    function questionsPath(quiz: Quiz) {
        return `/admin/questions/quiz/${quiz.quizId}/${encodeURIComponent(quiz.quizTitle ?? "quiz")}`;
    }

    return (
        <div>
            <PageHeader
                title="Quizzes"
                subtitle="All published and unpublished quizzes."
                action={
                    <Link to="/admin/add-quiz" className="btn-primary">
                        Add quiz
                    </Link>
                }
            />

            {loading && <Spinner label="Loading quizzes..." />}

            {!loading && quizzes.length === 0 && (
                <EmptyState title="No quizzes yet." description="Create a quiz and add questions to it." />
            )}

            <div className="space-y-4">
                {quizzes.map((quiz) => (
                    <article key={quiz.quizId} className="card card-body">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-900">{quiz.quizTitle}</h2>
                                    <span
                                        className={`badge ${
                                            quiz.isActiveQuiz
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-amber-200 bg-amber-50 text-amber-700"
                                        }`}
                                    >
                                        {quiz.isActiveQuiz ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    {quiz.quizDescription || "No description provided."}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="badge">{quiz.category?.categoryTitle ?? "No category"}</span>
                                    <span className="badge">Questions: {quiz.questionCount ?? 0}</span>
                                    <span className="badge">Marks: {quiz.quizMaxMarks ?? 0}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link to={questionsPath(quiz)} className="btn-primary">
                                    Questions
                                </Link>
                                <Link to={`/admin/quiz/${quiz.quizId}`} className="btn-secondary">
                                    Update
                                </Link>
                                <button type="button" onClick={() => deleteQuiz(quiz)} className="btn-danger">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
