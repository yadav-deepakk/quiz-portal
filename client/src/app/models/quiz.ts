import { CategoryModel } from "./category";

export interface QuizModel {
    quizId?: number;
    quizTitle?: string;
    quizDescription?: string | null;
    questionCount?: number;
    quizMaxMarks?: number;
    isActiveQuiz?: boolean;
    category: CategoryModel;
}
