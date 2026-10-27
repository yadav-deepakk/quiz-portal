import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { QuizModel } from "../models/quiz";
import { QuizResultModel } from "../models/quizResult";
import { QuestionModel } from "../models/question";

const baseURL: string = "http://localhost:8080/quiz";

@Injectable({
    providedIn: "root",
})
export class QuizService {
    constructor(private http: HttpClient) {}

    public postQuiz(quiz: QuizModel): Observable<QuizModel> {
        return this.http.post<QuizModel>(`${baseURL}`, quiz);
    }

    public getAllQuiz(): Observable<QuizModel[]> {
        return this.http.get<QuizModel[]>(`${baseURL}`);
    }

    public getQuizById(id: number): Observable<QuizModel> {
        return this.http.get<QuizModel>(`${baseURL}/${id}`);
    }

    public updateQuiz(quiz: QuizModel): Observable<QuizModel> {
        return this.http.put<QuizModel>(`${baseURL}`, quiz);
    }

    public deleteQuizById(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${baseURL}/${id}`);
    }

    public evaluateQuizResult(quesList: QuestionModel[]): Observable<QuizResultModel> {
        return this.http.post(`${baseURL}/eval-quiz`, quesList);
    }
}
