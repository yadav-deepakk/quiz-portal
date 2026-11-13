import { useMemo } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formatAttemptDate, getAttempts, scoreTone } from "../../lib/attemptHistory";

export function UserWelcome() {
    const { user } = useAuth();

    const attempts = useMemo(() => (user ? getAttempts(user.username) : []), [user]);
    const averageScore =
        attempts.length > 0
            ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.scorePercent, 0) / attempts.length)
            : 0;
    const bestScore = attempts.reduce((best, attempt) => Math.max(best, attempt.scorePercent), 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome${user ? `, ${user.firstName}` : ""} 👋`}
                subtitle="Your quiz dashboard — attempts, scores and new quizzes to explore."
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <article className="card card-body">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tests appeared</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{attempts.length}</p>
                    <p className="mt-1 text-xs text-slate-500">Quizzes you have submitted</p>
                </article>
                <article className="card card-body">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average score</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {averageScore}
                        <span className="text-lg">%</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Across all your attempts</p>
                </article>
                <article className="card card-body">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Best score</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {bestScore}
                        <span className="text-lg">%</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Keep pushing for 100!</p>
                </article>
            </div>

            <section>
                <h2 className="mb-3 text-lg font-bold text-slate-900">Tests you appeared in the past</h2>

                {attempts.length === 0 ? (
                    <div className="card card-body text-center">
                        <p className="font-semibold text-slate-700">No quizzes attempted yet.</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Take your first quiz and your scores will show up right here.
                        </p>
                        <Link to="/user/quizzes/0" className="btn-primary mx-auto mt-4">
                            Browse quizzes
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {attempts.map((attempt) => {
                            const tone = scoreTone(attempt.scorePercent);
                            return (
                                <li key={`${attempt.quizId}-${attempt.attemptedAt}`} className="card card-body">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                                {attempt.categoryTitle}
                                            </p>
                                            <h3 className="mt-0.5 font-bold text-slate-900">{attempt.quizTitle}</h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {formatAttemptDate(attempt.attemptedAt)} &middot;{" "}
                                                {attempt.correctAnswers} correct of {attempt.totalQuestions} questions
                                                ({attempt.attemptedQuestions} attempted)
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`text-2xl font-black ${tone.text}`}>
                                                    {attempt.scorePercent}%
                                                </p>
                                                <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className={`h-full rounded-full ${tone.bar}`}
                                                        style={{ width: `${attempt.scorePercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <Link to={`/start/${attempt.quizId}`} className="btn-secondary text-xs">
                                                Retake
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {user && (
                <section className="card card-body">
                    <h2 className="text-lg font-bold text-slate-900">Your account</h2>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-slate-500">Name</dt>
                            <dd className="font-semibold text-slate-900">
                                {user.firstName} {user.lastName}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Username</dt>
                            <dd className="font-semibold text-slate-900">@{user.username}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Email</dt>
                            <dd className="font-semibold text-slate-900">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Phone</dt>
                            <dd className="font-semibold text-slate-900">{user.phone}</dd>
                        </div>
                    </dl>
                </section>
            )}
        </div>
    );
}
