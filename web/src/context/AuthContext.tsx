import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { api, ApiError } from "../lib/api";
import type { JwtResponse, LoginRequest, Role, SignUpRequest, UserDetail } from "../types";

interface AuthContextValue {
    user: UserDetail | null;
    loading: boolean;
    isAuthenticated: boolean;
    hasRole: (role: Role) => boolean;
    login: (credentials: LoginRequest) => Promise<UserDetail>;
    signUp: (details: SignUpRequest) => Promise<UserDetail>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<UserDetail | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const currentUser = await api.get<UserDetail>("/user/current-user");
            setUser(currentUser);
            return currentUser;
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setUser(null);
                return null;
            }
            // The API may be unreachable; keep the user logged out rather than hanging.
            setUser(null);
            return null;
        }
    }, []);

    const refreshUser = useCallback(async () => fetchCurrentUser(), [fetchCurrentUser]);

    useEffect(() => {
        let active = true;

        fetchCurrentUser().finally(() => {
            if (active) {
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [fetchCurrentUser]);

    useEffect(() => {
        const handleUnauthorized = () => setUser(null);
        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }, []);

    const login = useCallback(
        async (credentials: LoginRequest) => {
            await api.post<JwtResponse>("/api/auth/login", credentials);
            const currentUser = await api.get<UserDetail>("/user/current-user");
            setUser(currentUser);
            return currentUser;
        },
        []
    );

    const signUp = useCallback(async (details: SignUpRequest) => {
        const response = await api.post<JwtResponse | undefined>("/api/auth/signup", details);
        if (!response) {
            throw new ApiError("That username is already taken.", 409);
        }

        const currentUser = await api.get<UserDetail>("/user/current-user");
        setUser(currentUser);
        return currentUser;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post<void>("/api/auth/logout");
        } finally {
            setUser(null);
        }
    }, []);

    const hasRole = useCallback(
        (role: Role) => user?.authorities?.some((authority) => authority.authority === role) ?? false,
        [user]
    );

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: user !== null,
            hasRole,
            login,
            signUp,
            logout,
            refreshUser,
        }),
        [user, loading, hasRole, login, signUp, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
