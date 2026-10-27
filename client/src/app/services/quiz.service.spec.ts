import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

import { QuizService } from "./quiz.service";
import { QuizModel } from "../models/quiz";
import { QuestionModel } from "../models/question";

const baseUrl = "http://localhost:8080/quiz";
const quiz: QuizModel = {
    quizId: 3,
    quizTitle: "Java Basics",
    quizDescription: "Basic Java",
    questionCount: 2,
    quizMaxMarks: 10,
    isActiveQuiz: true,
    category: { categoryId: 1, categoryTitle: "Java" },
};

describe("QuizService", () => {
    let service: QuizService;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(QuizService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should create a quiz", () => {
        service.postQuiz(quiz).subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(quiz);
        req.flush(quiz);
    });

    it("should fetch all quizzes", () => {
        service.getAllQuiz().subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush([quiz]);
    });

    it("should fetch a quiz by id", () => {
        service.getQuizById(3).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/3`);
        expect(req.request.method).toBe("GET");
        req.flush(quiz);
    });

    it("should update a quiz", () => {
        service.updateQuiz(quiz).subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("PUT");
        expect(req.request.body).toEqual(quiz);
        req.flush(quiz);
    });

    it("should delete a quiz", () => {
        service.deleteQuizById(3).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/3`);
        expect(req.request.method).toBe("DELETE");
        req.flush(true);
    });

    it("should evaluate a quiz result", () => {
        const questions: QuestionModel[] = [{ questionId: 1, givenAnswer: "4" }];

        service.evaluateQuizResult(questions).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/eval-quiz`);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(questions);
        req.flush({ score: 100 });
    });
});
