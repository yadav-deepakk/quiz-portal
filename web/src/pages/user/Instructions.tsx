import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { Quiz } from "../../types";

export function Instructions() {
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!quizId) {
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        api
            .get<Quiz>(`/quiz/${quizId}`)
            .then((data) => {
                if (active) {
                    setQuiz(data);
                }
            })
            .catch(() => {
                if (active) {
                    showToast("Unable to load quiz details.", "error");
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

    function startQuiz() {
        if (!quiz?.quizId) {
            return;
        }

        if (window.confirm(`Start "${quiz.quizTitle}" now? The timer begins immediately.`)) {
            navigate(`/start/${quiz.quizId}`);
        }
    }

    if (loading) {
        return <Spinner label="Loading instructions..." />;
    }

    if (!quiz) {
        return <p className="text-sm text-slate-500">Quiz details are unavailable.</p>;
    }

    const questionCount = quiz.questionCount ?? 0;

    return (
        <div className="max-w-3xl">
            <PageHeader title="Quiz instructions" subtitle="Read this page carefully before taking the quiz." />

            <div className="card card-body">
                <h2 className="text-xl font-bold text-slate-900">{quiz.quizTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{quiz.quizDescription || "No description provided."}</p>

                <div className="mt-5 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                    This quiz has <strong>{questionCount} questions</strong>, a maximum of{" "}
                    <strong>{quiz.quizMaxMarks ?? 0} marks</strong>, and a time limit of{" "}
                    <strong>{questionCount * 2} minutes</strong>.
                </div>

                <h3 className="mt-6 font-bold text-slate-900">Important instructions</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    <li>This quiz is for practice purposes.</li>
                    <li>All questions are multiple choice with a single correct answer.</li>
                    <li>There is no negative marking for wrong answers.</li>
                    <li>You may attempt the quiz as many times as you like.</li>
                    <li>The timer starts as soon as you begin and cannot be paused.</li>
                    <li>Your score is evaluated on the server after you submit.</li>
                </ul>

                <div className="mt-7 flex flex-wrap gap-3">
                    <button type="button" onClick={startQuiz} className="btn-primary">
                        Start quiz
                    </button>
                    <Link to="/user" className="btn-secondary">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
