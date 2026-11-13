import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../lib/api";

interface LoginFormValues {
    username: string;
    password: string;
}

const usernamePattern = /^[a-zA-Z0-9_]{3,255}$/;

export function Login() {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        defaultValues: { username: "", password: "" },
        mode: "onSubmit",
    });

    const from = (location.state as { from?: string } | null)?.from;

    const onSubmit = async (values: LoginFormValues) => {
        try {
            const currentUser = await login({ username: values.username.trim(), password: values.password });
            showToast("Logged in successfully.", "success");
            const isAdmin = currentUser.authorities.some((authority) => authority.authority === "ADMIN");
            navigate(from ?? (isAdmin ? "/admin" : "/user"), { replace: true });
        } catch (err) {
            showToast(
                err instanceof ApiError && err.status === 401
                    ? "Invalid username or password."
                    : "Unable to log in. Please try again.",
                "error"
            );
        }
    };

    return (
        <div className="mx-auto max-w-md">
            <div className="card card-body">
                <div className="text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-200">
                        Q
                    </span>
                    <h1 className="page-title mt-4">Welcome back</h1>
                    <p className="page-subtitle">Log in to continue your practice.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-7" noValidate>
                    <div className="field">
                        <label className="label" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            className={`input ${errors.username ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`}
                            placeholder="eg. john_doe"
                            autoComplete="username"
                            aria-invalid={Boolean(errors.username)}
                            {...register("username", {
                                required: "Username is required.",
                                pattern: {
                                    value: usernamePattern,
                                    message:
                                        "Username should be 3-255 characters and may contain letters, digits, or underscores.",
                                },
                            })}
                        />
                        {errors.username && (
                            <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                className={`input pr-16 ${errors.password ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                aria-invalid={Boolean(errors.password)}
                                {...register("password", {
                                    required: "Password is required.",
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button type="submit" className="btn-primary mt-2 w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
