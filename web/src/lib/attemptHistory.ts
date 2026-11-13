import type { QuizResult } from "../types";

export interface Attempt {
    quizId: number;
    quizTitle: string;
    categoryTitle: string;
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    /** Percentage 0-100, as returned by the quiz evaluation endpoint. */
    scorePercent: number;
    attemptedAt: string;
}

const STORAGE_PREFIX = "quiz-portal.attempts.";

function storageKey(username: string) {
    return `${STORAGE_PREFIX}${username}`;
}

export function getAttempts(username: string): Attempt[] {
    try {
        const raw = window.localStorage.getItem(storageKey(username));
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as Attempt[];
        return Array.isArray(parsed) ? parsed.sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt)) : [];
    } catch {
        return [];
    }
}

export function recordAttempt(
    username: string,
    quiz: { quizId?: number; quizTitle?: string; categoryTitle?: string },
    result: QuizResult
): Attempt | null {
    if (!quiz.quizId || !username) {
        return null;
    }

    const attempt: Attempt = {
        quizId: quiz.quizId,
        quizTitle: quiz.quizTitle ?? `Quiz #${quiz.quizId}`,
        categoryTitle: quiz.categoryTitle ?? "Uncategorised",
        totalQuestions: result.totalQuestionCount ?? 0,
        attemptedQuestions: result.attemptedQuestionCount ?? 0,
        correctAnswers: result.correctAnswerCount ?? 0,
        scorePercent: Math.round(result.score ?? 0),
        attemptedAt: new Date().toISOString(),
    };

    try {
        const attempts = getAttempts(username);
        attempts.unshift(attempt);
        // Keep the most recent 50 attempts per user so storage cannot grow unbounded.
        window.localStorage.setItem(storageKey(username), JSON.stringify(attempts.slice(0, 50)));
    } catch {
        // Storage may be unavailable (private mode); the in-memory result page still works.
    }

    return attempt;
}

export function formatAttemptDate(isoDate: string) {
    const date = new Date(isoDate);
    return date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function scoreTone(scorePercent: number): { text: string; bar: string; chip: string } {
    if (scorePercent >= 80) {
        return { text: "text-emerald-600", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }

    if (scorePercent >= 50) {
        return { text: "text-amber-600", bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200" };
    }

    return { text: "text-rose-600", bar: "bg-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200" };
}
