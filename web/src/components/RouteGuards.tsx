import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";
import { FullPageSpinner } from "./Spinner";

function dashboardPathFor(hasRole: (role: Role) => boolean) {
    return hasRole("ADMIN") ? "/admin" : "/user";
}

export function ProtectedRoute({ role }: { role?: Role }) {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return <FullPageSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    }

    if (role && !hasRole(role)) {
        return <Navigate to={dashboardPathFor(hasRole)} replace />;
    }

    return <Outlet />;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
    const { user, loading, hasRole } = useAuth();

    if (loading) {
        return <FullPageSpinner />;
    }

    if (user) {
        return <Navigate to={dashboardPathFor(hasRole)} replace />;
    }

    return <>{children}</>;
}
