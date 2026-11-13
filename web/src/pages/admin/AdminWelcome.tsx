import { Link } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

const quickLinks = [
    { to: "/admin/category", title: "Manage categories", description: "View, edit, or remove quiz categories." },
    { to: "/admin/add-category", title: "Add a category", description: "Group related quizzes under a new category." },
    { to: "/admin/quiz", title: "Manage quizzes", description: "Update quiz details and manage their questions." },
    { to: "/admin/add-quiz", title: "Create a quiz", description: "Publish a new quiz for learners to attempt." },
];

export function AdminWelcome() {
    const { user } = useAuth();

    return (
        <div>
            <PageHeader
                title={`Welcome${user ? `, ${user.firstName}` : ""}`}
                subtitle="Manage the quiz portal from this dashboard."
            />

            <div className="grid gap-4 sm:grid-cols-2">
                {quickLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="card card-body transition hover:border-indigo-300 hover:shadow-md">
                        <h2 className="font-bold text-slate-900">{link.title}</h2>
                        <p className="mt-1 text-sm text-slate-500">{link.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
