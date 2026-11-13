import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../lib/api";
import type { SignUpRequest } from "../types";

interface SignupFormValues extends SignUpRequest {}

const namePattern = /^[a-zA-Z]{1,255}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9]{10}$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,255}$/;

export function Signup() {
    const { signUp } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            username: "",
            password: "",
        },
        mode: "onSubmit",
    });

    const onSubmit = async (values: SignupFormValues) => {
        try {
            await signUp(values);
            showToast("Account created successfully. Welcome aboard!", "success");
            navigate("/user", { replace: true });
        } catch (err) {
            const message =
                err instanceof ApiError && err.status === 409
                    ? err.message
                    : "Unable to create the account. The username may already be taken.";
            showToast(message, "error");
        }
    };

    const fieldClass = (hasError: boolean) =>
        `input ${hasError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`;

    return (
        <div className="mx-auto max-w-xl">
            <div className="card card-body">
                <div className="text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-200">
                        Q
                    </span>
                    <h1 className="page-title mt-4">Create your account</h1>
                    <p className="page-subtitle">Register to start attempting quizzes.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-x-5 sm:grid-cols-2" noValidate>
                    <div className="field">
                        <label className="label" htmlFor="firstName">
                            First name
                        </label>
                        <input
                            id="firstName"
                            className={fieldClass(Boolean(errors.firstName))}
                            placeholder="eg. John"
                            autoComplete="given-name"
                            aria-invalid={Boolean(errors.firstName)}
                            {...register("firstName", {
                                required: "First name is required.",
                                pattern: { value: namePattern, message: "First name may only contain letters." },
                            })}
                        />
                        {errors.firstName && <FieldError message={errors.firstName.message} />}
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="lastName">
                            Last name
                        </label>
                        <input
                            id="lastName"
                            className={fieldClass(Boolean(errors.lastName))}
                            placeholder="eg. Richards"
                            autoComplete="family-name"
                            aria-invalid={Boolean(errors.lastName)}
                            {...register("lastName", {
                                required: "Last name is required.",
                                pattern: { value: namePattern, message: "Last name may only contain letters." },
                            })}
                        />
                        {errors.lastName && <FieldError message={errors.lastName.message} />}
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className={fieldClass(Boolean(errors.email))}
                            placeholder="eg. rich@gmail.com"
                            autoComplete="email"
                            aria-invalid={Boolean(errors.email)}
                            {...register("email", {
                                required: "Email is required.",
                                pattern: { value: emailPattern, message: "Enter a valid email address." },
                            })}
                        />
                        {errors.email && <FieldError message={errors.email.message} />}
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="phone">
                            Phone number
                        </label>
                        <input
                            id="phone"
                            inputMode="numeric"
                            className={fieldClass(Boolean(errors.phone))}
                            placeholder="eg. 9990001210"
                            autoComplete="tel"
                            aria-invalid={Boolean(errors.phone)}
                            {...register("phone", {
                                required: "Phone number is required.",
                                pattern: { value: phonePattern, message: "Enter a 10 digit phone number." },
                            })}
                        />
                        {errors.phone && <FieldError message={errors.phone.message} />}
                    </div>

                    <div className="field sm:col-span-2">
                        <label className="label" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            className={fieldClass(Boolean(errors.username))}
                            placeholder="eg. john_rics (must be unique)"
                            autoComplete="username"
                            aria-invalid={Boolean(errors.username)}
                            {...register("username", {
                                required: "Username is required.",
                                pattern: {
                                    value: usernamePattern,
                                    message: "Username should be 3-255 characters and may contain letters, digits, or underscores.",
                                },
                            })}
                        />
                        {errors.username && <FieldError message={errors.username.message} />}
                    </div>

                    <div className="field sm:col-span-2">
                        <label className="label" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                className={`pr-16 ${fieldClass(Boolean(errors.password))}`}
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                aria-invalid={Boolean(errors.password)}
                                {...register("password", {
                                    required: "Password is required.",
                                    minLength: { value: 6, message: "Password must be at least 6 characters." },
                                    maxLength: { value: 255, message: "Password may not exceed 255 characters." },
                                    validate: {
                                        uppercase: (value) =>
                                            /[A-Z]/.test(value) || "Include at least one uppercase letter.",
                                        digit: (value) => /\d/.test(value) || "Include at least one digit.",
                                        special: (value) =>
                                            /[!@#$%^&*()[\]{}./]/.test(value) ||
                                            "Include at least one special character (! @ # $ % ^ & * etc.).",
                                    },
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
                        {errors.password && <FieldError message={errors.password.message} />}
                    </div>

                    <div className="sm:col-span-2">
                        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creating account..." : "Sign up"}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    return (
        <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
            {message}
        </p>
    );
}
