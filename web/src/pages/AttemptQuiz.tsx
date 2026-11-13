import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { recordAttempt } from "../lib/attemptHistory";
import type { Question, Quiz, QuizResult } from "../types";

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AttemptQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();

    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [remaining, setRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const totalTimeRef = useRef(0);
    const submittedRef = useRef(false);

    useEffect(() => {
        if (!quizId) {
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        Promise.all([api.get<Question[] | null>(`/question/quiz/${quizId}`), api.get<Quiz>(`/quiz/${quizId}`)])
            .then(([questionData, quizData]) => {
                if (!active) {
                    return;
                }

                if (!questionData || questionData.length === 0) {
                    showToast(
                        "Unable to start the quiz. It may be inactive or have insufficient questions.",
                        "error"
                    );
                    navigate("/user", { replace: true });
                    return;
                }

                const seconds = questionData.length * 2 * 60;
                totalTimeRef.current = seconds;
                submittedRef.current = false;
                setQuestions(questionData);
                setQuiz(quizData);
                setRemaining(seconds);
            })
            .catch(() => {
                if (active) {
                    showToast("Unable to load the quiz questions.", "error");
                    navigate("/user", { replace: true });
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
    }, [quizId, navigate, showToast]);

    useEffect(() => {
        if (!questions || result) {
            return;
        }

        const interval = window.setInterval(() => {
            setRemaining((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(interval);
    }, [questions, result]);

    useEffect(() => {
        if (!questions || result) {
            return;
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [questions, result]);

    const submitQuiz = useCallback(
        async (timeExpired: boolean) => {
            if (!questions || submittedRef.current) {
                return;
            }

            submittedRef.current = true;
            setSubmitting(true);

            try {
                const evaluation = await api.post<QuizResult>("/quiz/eval-quiz", questions);
                setResult(evaluation);
                if (user) {
                    recordAttempt(
                        user.username,
                        {
                            quizId: quiz?.quizId,
                            quizTitle: quiz?.quizTitle,
                            categoryTitle: quiz?.category?.categoryTitle,
                        },
                        evaluation
                    );
                }
                showToast(timeExpired ? "Time is up. Your quiz was submitted." : "Quiz submitted.", timeExpired ? "info" : "success");
            } catch {
                submittedRef.current = false;
                showToast("Unable to submit the quiz. Please try again.", "error");
            } finally {
                setSubmitting(false);
            }
        },
        [questions, user, quiz, showToast]
    );

    useEffect(() => {
        if (!questions || result || totalTimeRef.current === 0 || remaining > 0) {
            return;
        }

        void submitQuiz(true);
    }, [remaining, questions, result, submitQuiz]);

    function handleManualSubmit() {
        if (submitting) {
            return;
        }

        if (!window.confirm("Submit the quiz now? You cannot change your answers afterwards.")) {
            return;
        }

        void submitQuiz(false);
    }

    function selectAnswer(questionId: number | undefined, answer: string) {
        setQuestions((current) =>
            current
                ? current.map((question) =>
                      question.questionId === questionId ? { ...question, givenAnswer: answer } : question
                  )
                : current
        );
    }

    if (loading) {
        return <Spinner label="Preparing your quiz..." />;
    }

    if (result) {
        return (
            <div className="mx-auto max-w-lg">
                <div className="card card-body text-center">
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Quiz result</p>
                    <p className="mt-3 text-5xl font-black text-slate-900">
                        {Math.round(result.score ?? 0)}
                        <span className="text-2xl">%</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {result.correctAnswerCount ?? 0} of {result.totalQuestionCount ?? 0} answers were correct.
                    </p>

                    <dl className="mt-6 grid grid-cols-2 gap-3 text-left">
                        <div className="rounded-lg bg-slate-50 p-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">Total</dt>
                            <dd className="text-lg font-bold text-slate-900">{result.totalQuestionCount ?? 0}</dd>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                            <dt className="text-xs uppercase tracking-wide text-slate-500">Attempted</dt>
                            <dd className="text-lg font-bold text-slate-900">{result.attemptedQuestionCount ?? 0}</dd>
                        </div>
                    </dl>

                    <Link to="/user" className="btn-primary mt-6 w-full">
                        Go to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (!questions) {
        return <p className="text-sm text-slate-500">Quiz questions are unavailable.</p>;
    }

    const progress = totalTimeRef.current > 0 ? (remaining / totalTimeRef.current) * 100 : 0;

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
            <div className="space-y-4">
                <div className="card card-body">
                    <h1 className="text-xl font-bold text-slate-900">{quiz?.quizTitle ?? "Quiz"}</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {questions.length} questions &middot; {quiz?.quizMaxMarks ?? 0} marks
                    </p>
                </div>

                {questions.map((question, index) => (
                    <article key={question.questionId} className="card card-body">
                        <h2 className="font-semibold text-slate-900">
                            <span className="mr-1 text-slate-400">Q{index + 1}.</span>
                            {question.questionContent}
                        </h2>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {[question.option1, question.option2, question.option3, question.option4].map(
                                (option, optionIndex) =>
                                    option ? (
                                        <label
                                            key={optionIndex}
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                                                question.givenAnswer === option
                                                    ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                className="h-4 w-4 text-indigo-600"
                                                name={`question-${question.questionId}`}
                                                value={option}
                                                checked={question.givenAnswer === option}
                                                onChange={() => selectAnswer(question.questionId, option)}
                                            />
                                            {option}
                                        </label>
                                    ) : null
                            )}
                        </div>
                    </article>
                ))}
            </div>

            <aside>
                <div className="card card-body lg:sticky lg:top-24">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Time remaining</p>
                    <p className={`mt-1 text-3xl font-black ${remaining <= 60 ? "text-rose-600" : "text-slate-900"}`}>
                        {formatTime(remaining)}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full transition-all ${
                                remaining <= 60 ? "bg-rose-500" : "bg-indigo-600"
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <button type="button" onClick={handleManualSubmit} className="btn-primary mt-5 w-full" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit quiz"}
                    </button>
                    <p className="mt-2 text-center text-xs text-slate-400">
                        {questions.filter((question) => question.givenAnswer).length} of {questions.length} answered
                    </p>
                </div>
            </aside>
        </div>
    );
}
