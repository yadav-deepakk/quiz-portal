import { Link, Outlet } from "react-router-dom";

import { Navbar } from "./Navbar";

export function Layout() {
    const year = new Date().getFullYear();

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
                <Outlet />
            </main>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-black text-white">
                                Q
                            </span>
                            Quiz Portal
                        </Link>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
                            A lightweight exam portal for learners and administrators. Practice, learn, repeat — track
                            every attempt on your dashboard.
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Explore</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            <li>
                                <Link to="/" className="hover:text-indigo-600">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="hover:text-indigo-600">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/signup" className="hover:text-indigo-600">
                                    Create an account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Quick start</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            <li>Sign up or log in</li>
                            <li>Choose a quiz category</li>
                            <li>Attempt and get instant results</li>
                            <li>Revisit your past scores on the dashboard</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
                    &copy; {year} Quiz Portal &middot; Practice, learn, repeat.
                </div>
            </footer>
        </div>
    );
}
