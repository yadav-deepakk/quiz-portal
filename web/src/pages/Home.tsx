import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const features = [
    {
        icon: "📚",
        title: "Practice quizzes",
        description:
            "Browse quizzes by category, read the instructions, and attempt them at your own pace — all in one place.",
    },
    {
        icon: "⚡",
        title: "Instant results",
        description:
            "Answers are evaluated on the server, so your score is ready the moment you submit. No waiting around.",
    },
    {
        icon: "📈",
        title: "Progress tracking",
        description:
            "Every attempt is saved on your dashboard, so you can watch your scores climb over time and retake tricky quizzes.",
    },
];

const steps = [
    {
        number: "1",
        title: "Create your account",
        description: "Sign up with your name, email and a unique username in under a minute.",
    },
    {
        number: "2",
        title: "Pick a quiz",
        description: "Explore active quizzes across categories and read the instructions before you start.",
    },
    {
        number: "3",
        title: "Beat the clock and see your score",
        description: "Answer each question, submit before the timer ends, and get your result instantly.",
    },
];

export function Home() {
    const { user, hasRole, loading } = useAuth();
    const dashboardPath = hasRole("ADMIN") ? "/admin" : "/user";

    return (
        <div className="space-y-20">
            {/* Promo / hero */}
            <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        Exam practice made simple
                    </p>
                    <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                        Learn faster with{" "}
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                            focused practice quizzes.
                        </span>
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                        Quiz Portal is a simple exam portal for learners and administrators. Attempt timed
                        multiple-choice quizzes, get instant scores, and track every attempt on your personal
                        dashboard.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {!loading && user ? (
                            <Link to={dashboardPath} className="btn-primary px-6 py-3 text-base">
                                Go to your dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn-primary px-6 py-3 text-base">
                                    Get started free →
                                </Link>
                                <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                                    I already have an account
                                </Link>
                            </>
                        )}
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                        Teachers and admins get a full panel for categories, quizzes and questions.
                    </p>
                </div>

                <div className="relative mx-auto w-full max-w-md">
                    <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-100 to-transparent blur-2xl" />
                    <div className="card relative space-y-4 p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <span className="badge border-indigo-200 bg-indigo-50 text-indigo-700">Sample attempt</span>
                            <span className="badge">02:00 timer</span>
                        </div>
                        <p className="font-semibold text-slate-900">Which data structure works in LIFO order?</p>
                        <div className="space-y-2">
                            <p className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">Queue</p>
                            <p className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                                Stack ✓
                            </p>
                            <p className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                                Binary tree
                            </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="text-xs text-slate-500">Result computed instantly</span>
                            <span className="text-2xl font-black text-emerald-600">100%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section>
                <h2 className="text-center text-3xl font-black tracking-tight text-slate-900">
                    Everything you need to practise
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
                    Built for learners who want to test themselves and teachers who want an easy way to create tests.
                </p>
                <div className="mt-10 grid gap-5 sm:grid-cols-3">
                    {features.map((feature) => (
                        <article key={feature.title} className="card card-body transition hover:-translate-y-1 hover:shadow-lg">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-2xl">
                                {feature.icon}
                            </span>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{feature.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
                <h2 className="text-center text-3xl font-black tracking-tight text-slate-900">How it works</h2>
                <div className="mt-10 grid gap-8 sm:grid-cols-3">
                    {steps.map((step) => (
                        <div key={step.number} className="relative text-center sm:text-left">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 text-sm font-black text-white">
                                {step.number}
                            </span>
                            <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Closing CTA band */}
            <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 px-6 py-14 text-white shadow-lg sm:px-12 sm:py-16">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                        Ready to test yourself?
                    </h2>
                    <p className="mt-3 text-indigo-100">
                        Create an account in seconds and take your first quiz today. Your scores are waiting on the
                        dashboard.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {!loading && user ? (
                            <Link to={dashboardPath} className="btn bg-white px-6 py-3 text-base text-indigo-700 hover:bg-indigo-50">
                                Open dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn bg-white px-6 py-3 text-base text-indigo-700 hover:bg-indigo-50">
                                    Create an account
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn border border-white/40 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20"
                                >
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
