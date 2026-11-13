import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function navClass({ isActive }: { isActive: boolean }) {
    return `rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
}

export function Navbar() {
    const { user, loading, hasRole, logout } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    const dashboardPath = hasRole("ADMIN") ? "/admin" : "/user";

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await logout();
            navigate("/login", { replace: true });
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
                <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-black text-white shadow-sm shadow-indigo-200">
                        Q
                    </span>
                    Quiz Portal
                </Link>

                <nav className="ml-auto flex items-center gap-1">
                    {!loading && !user && (
                        <>
                            <NavLink to="/login" className={navClass}>
                                Login
                            </NavLink>
                            <NavLink
                                to="/signup"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Register
                            </NavLink>
                        </>
                    )}

                    {!loading && user && (
                        <>
                            <NavLink to="/" className={navClass}>
                                Home
                            </NavLink>
                            <NavLink to={dashboardPath} className={navClass}>
                                Dashboard
                            </NavLink>
                            <span className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 sm:flex">
                                <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                    {(user.firstName || user.username).slice(0, 1).toUpperCase()}
                                </span>
                                <span className="max-w-32 truncate">{user.username}</span>
                            </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="btn-secondary"
                            >
                                {loggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
