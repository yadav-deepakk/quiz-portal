import { Link } from "react-router-dom";

export function NotFound() {
    return (
        <div className="mx-auto max-w-lg py-20 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">404</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">Page not found</h1>
            <p className="mt-3 text-slate-500">The page you are looking for does not exist or has moved.</p>
            <Link to="/" className="btn-primary mt-6">
                Back to home
            </Link>
        </div>
    );
}
