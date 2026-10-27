import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

import { QuestionService } from "./question.service";
import { QuestionModel } from "../models/question";

const baseUrl = "http://localhost:8080/question";
const question: QuestionModel = {
    questionId: 1,
    questionContent: "What is 2 + 2?",
    option1: "2",
    option2: "3",
    option3: "4",
    option4: "5",
    answer: "4",
};

describe("QuestionService", () => {
    let service: QuestionService;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(QuestionService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should create a question", () => {
        service.postQuestion(question).subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(question);
        req.flush(question);
    });

    it("should fetch all questions", () => {
        service.getAllQuestion().subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush([question]);
    });

    it("should fetch a question by id", () => {
        service.getQuestionById(1).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/1`);
        expect(req.request.method).toBe("GET");
        req.flush(question);
    });

    it("should fetch all questions of a quiz for admins", () => {
        service.getAllQuestionOfQuizForAdmin(7).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/quiz/all/7`);
        expect(req.request.method).toBe("GET");
        req.flush([question]);
    });

    it("should fetch questions of a quiz for a test", () => {
        service.getQuestionOfQuizForTest(7).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/quiz/7`);
        expect(req.request.method).toBe("GET");
        req.flush([question]);
    });

    it("should update a question", () => {
        service.updateQuestion(question).subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("PUT");
        expect(req.request.body).toEqual(question);
        req.flush(question);
    });

    it("should delete a question", () => {
        service.deleteQuestion(1).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/1`);
        expect(req.request.method).toBe("DELETE");
        req.flush(true);
    });
});
