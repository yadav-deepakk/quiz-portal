export type Role = "ADMIN" | "NORMAL";

export interface Authority {
    authority: Role | string;
}

export interface UserDetail {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profile: string;
    phone: string;
    isActive: boolean;
    enabled: boolean;
    credentialsNonExpired: boolean;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    authorities: Authority[];
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface SignUpRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
}

export interface JwtResponse {
    username: string;
    /** Present for backwards compatibility. Browser clients use the HttpOnly cookie instead. */
    jwt?: string;
}

export interface Category {
    categoryId?: number;
    categoryTitle?: string;
    categoryDescription?: string;
}

export interface Quiz {
    quizId?: number;
    quizTitle?: string;
    quizDescription?: string | null;
    questionCount?: number;
    quizMaxMarks?: number;
    isActiveQuiz?: boolean;
    category: Category;
}

export interface Question {
    questionId?: number;
    questionContent?: string;
    image?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    answer?: string;
    givenAnswer?: string;
    quiz?: Quiz;
}

export interface QuizResult {
    totalQuestionCount?: number;
    attemptedQuestionCount?: number;
    correctAnswerCount?: number;
    score?: number;
}
