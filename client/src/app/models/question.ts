import { QuizModel } from "./quiz";

export interface QuestionModel {
    questionId?: number;
    questionContent?: string;
    /** Legacy name kept for compatibility with older payloads. */
    questionImage?: string;
    image?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    answer?: string;
    givenAnswer?: string;
    quiz?: QuizModel;
}
