import { useEffect, useState } from "react";

import { PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { UserDetail } from "../../types";

export function Profile() {
    const { user: cachedUser } = useAuth();
    const { showToast } = useToast();
    const [user, setUser] = useState<UserDetail | null>(cachedUser);
    const [loading, setLoading] = useState(cachedUser === null);

    useEffect(() => {
        let active = true;

        api
            .get<UserDetail>("/user/current-user")
            .then((data) => {
                if (active) {
                    setUser(data);
                }
            })
            .catch(() => {
                if (active) {
                    showToast("Unable to load profile details.", "error");
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
    }, [showToast]);

    if (loading) {
        return <Spinner label="Loading profile..." />;
    }

    if (!user) {
        return <p className="text-sm text-slate-500">Profile details are unavailable.</p>;
    }

    const rows = [
        ["User ID", `EXAM00-${user.userId}`],
        ["First name", user.firstName],
        ["Last name", user.lastName],
        ["Username", user.username],
        ["Email", user.email],
        ["Phone", user.phone],
        ["Role", user.authorities.map((authority) => authority.authority).join(", ")],
        ["Status", user.isActive ? "Active" : "Deactivated"],
    ];

    return (
        <div>
            <PageHeader title="Your profile" subtitle="Account details for the signed-in user." />

            <div className="card card-body">
                <div className="mb-6 flex items-center gap-4">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-indigo-100 text-xl font-black text-indigo-700">
                        {user.firstName.slice(0, 1)}
                        {user.lastName.slice(0, 1)}
                    </span>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                    </div>
                </div>

                <dl className="divide-y divide-slate-100">
                    {rows.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[140px_1fr] gap-4 py-3 text-sm">
                            <dt className="font-medium text-slate-500">{label}</dt>
                            <dd className="font-semibold text-slate-900">{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
}
