import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { QuestionModel } from "../models/question";
import { Observable } from "rxjs";

const baseURL: string = "http://localhost:8080/question";

@Injectable({
    providedIn: "root",
})
export class QuestionService {
    constructor(private http: HttpClient) {}

    postQuestion(ques: QuestionModel): Observable<QuestionModel> {
        return this.http.post<QuestionModel>(`${baseURL}`, ques);
    }

    getAllQuestion(): Observable<QuestionModel[]> {
        return this.http.get<QuestionModel[]>(`${baseURL}`);
    }

    getQuestionById(quesId: number): Observable<QuestionModel> {
        return this.http.get<QuestionModel>(`${baseURL}/${quesId}`);
    }

    getAllQuestionOfQuizForAdmin(quizId: number): Observable<QuestionModel[]> {
        return this.http.get<QuestionModel[]>(`${baseURL}/quiz/all/${quizId}`);
    }

    getQuestionOfQuizForTest(quizId: number): Observable<QuestionModel[]> {
        return this.http.get<QuestionModel[]>(`${baseURL}/quiz/${quizId}`);
    }

    updateQuestion(ques: QuestionModel): Observable<QuestionModel> {
        return this.http.put<QuestionModel>(`${baseURL}`, ques);
    }

    deleteQuestion(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${baseURL}/${id}`);
    }
}
