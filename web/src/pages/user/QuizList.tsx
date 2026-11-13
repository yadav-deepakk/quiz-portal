import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { EmptyState, PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { Quiz } from "../../types";

export function QuizList() {
    const { categoryId } = useParams();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const selectedCategoryId = Number(categoryId ?? 0);

    useEffect(() => {
        let active = true;
        setLoading(true);

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

    const visibleQuizzes = quizzes.filter((quiz) => {
        if (!quiz.isActiveQuiz) {
            return false;
        }
        return selectedCategoryId > 0 ? quiz.category?.categoryId === selectedCategoryId : true;
    });

    return (
        <div>
            <PageHeader
                title="Available quizzes"
                subtitle={
                    selectedCategoryId > 0
                        ? "Active quizzes in the selected category."
                        : "All active quizzes across every category."
                }
            />

            {loading && <Spinner label="Loading quizzes..." />}

            {!loading && visibleQuizzes.length === 0 && (
                <EmptyState
                    title="No quizzes to display."
                    description="Try another category or check back later."
                />
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {visibleQuizzes.map((quiz) => (
                    <article key={quiz.quizId} className="card card-body flex flex-col">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                {quiz.category?.categoryTitle ?? "Uncategorised"}
                            </p>
                            <h2 className="mt-1 text-lg font-bold text-slate-900">{quiz.quizTitle}</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                {quiz.quizDescription || "No description provided."}
                            </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="badge">Questions: {quiz.questionCount ?? 0}</span>
                            <span className="badge">Marks: {quiz.quizMaxMarks ?? 0}</span>
                            <span className="badge">Time: {(quiz.questionCount ?? 0) * 2} min</span>
                        </div>

                        <div className="mt-5 flex gap-2">
                            <Link to={`/user/quiz/instruction/${quiz.quizId}`} className="btn-secondary">
                                View
                            </Link>
                            <Link to={`/start/${quiz.quizId}`} className="btn-primary">
                                Attempt
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
