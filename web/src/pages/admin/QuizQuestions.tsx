import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { EmptyState, PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { Question } from "../../types";

export function QuizQuestions() {
    const { quizId, quizTitle } = useParams();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const title = quizTitle ?? "Quiz";

    useEffect(() => {
        if (!quizId) {
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        api
            .get<Question[]>(`/question/quiz/all/${quizId}`)
            .then((data) => {
                if (active) {
                    setQuestions(Array.isArray(data) ? data : []);
                }
            })
            .catch(() => {
                if (active) {
                    showToast(`Unable to load questions for ${title}.`, "error");
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
    }, [quizId, title, showToast]);

    async function deleteQuestion(question: Question) {
        if (!question.questionId) {
            return;
        }

        if (!window.confirm(`Delete this question?\n\n${question.questionContent ?? ""}`)) {
            return;
        }

        try {
            await api.delete<boolean>(`/question/${question.questionId}`);
            setQuestions((current) => current.filter((item) => item.questionId !== question.questionId));
            showToast("Question deleted.", "success");
        } catch {
            showToast("Unable to delete the question.", "error");
        }
    }

    const encodedTitle = encodeURIComponent(title);

    return (
        <div>
            <PageHeader
                title={`Questions of ${title}`}
                subtitle="Review the correct answers and manage each question."
                action={
                    <Link to={`/admin/add-question/quiz/${quizId}/${encodedTitle}`} className="btn-primary">
                        Add question
                    </Link>
                }
            />

            {loading && <Spinner label="Loading questions..." />}

            {!loading && questions.length === 0 && (
                <EmptyState title="No questions in this quiz." description="Add the first question to get started." />
            )}

            <div className="space-y-4">
                {questions.map((question, index) => (
                    <article key={question.questionId} className="card card-body">
                        <h2 className="font-semibold text-slate-900">
                            <span className="mr-1 text-slate-400">Q{index + 1}.</span>
                            {question.questionContent}
                        </h2>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {[question.option1, question.option2, question.option3, question.option4].map(
                                (option, optionIndex) => (
                                    <div
                                        key={optionIndex}
                                        className={`rounded-lg border px-3 py-2 text-sm ${
                                            option === question.answer
                                                ? "border-emerald-200 bg-emerald-50 font-semibold text-emerald-800"
                                                : "border-slate-200 bg-slate-50 text-slate-700"
                                        }`}
                                    >
                                        {option}
                                    </div>
                                )
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-slate-600">
                                <span className="font-semibold text-slate-900">Answer:</span> {question.answer}
                            </p>
                            <div className="flex gap-2">
                                <Link
                                    to={`/admin/update-question/quiz/${quizId}/${encodedTitle}/${question.questionId}`}
                                    className="btn-secondary"
                                >
                                    Update
                                </Link>
                                <button type="button" onClick={() => deleteQuestion(question)} className="btn-danger">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {!loading && questions.length > 0 && (
                <p className="mt-6">
                    <Link to="/admin/quiz" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                        &larr; Back to all quizzes
                    </Link>
                </p>
            )}

        </div>
    );
}
