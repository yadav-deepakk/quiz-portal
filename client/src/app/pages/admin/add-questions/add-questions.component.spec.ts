import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { AddQuestionsComponent } from "./add-questions.component";
import { QuestionService } from "@app/services/question.service";
import { QuestionModel } from "@app/models/question";

describe("AddQuestionsComponent", () => {
    let component: AddQuestionsComponent;
    let fixture: ComponentFixture<AddQuestionsComponent>;
    let router: Router;
    let snackBar: MatSnackBar;
    let questionService: {
        postQuestion: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        questionService = { postQuestion: vi.fn().mockReturnValue(of({ questionId: 1 })) };

        TestBed.configureTestingModule({
            imports: [AddQuestionsComponent],
            providers: [
                provideRouter([]),
                { provide: QuestionService, useValue: questionService },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { params: { quizId: 7, quizTitle: "Java Basics" } } },
                },
            ],
        });
        fixture = TestBed.createComponent(AddQuestionsComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");
        router = TestBed.inject(Router);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    const validQuestion: QuestionModel = {
        questionContent: "What is 2 + 2?",
        option1: "2",
        option2: "3",
        option3: "4",
        option4: "5",
        answer: "4",
    };

    it("should create and read the quiz route parameters", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.quizIdQueryParameter).toBe(7);
        expect(component.quizTitleQueryParameter).toBe("Java Basics");
        expect(component.quiz.quizId).toBe(7);
        expect(component.question.quiz).toBe(component.quiz);
    });

    it("should reject incomplete questions", () => {
        expect(component.validateForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Fields are mandatory!", "OK", { duration: 2400 });
    });

    it("should reject a blank question field", () => {
        component.question = { ...validQuestion, option4: "   " };

        expect(component.validateForm()).toBe(false);
    });

    it("should reject a null question field", () => {
        component.question = { ...validQuestion, questionContent: null as any };

        expect(component.validateForm()).toBe(false);
    });

    it("should accept a complete question", () => {
        component.question = { ...validQuestion };

        expect(component.validateForm()).toBe(true);
    });

    it("should not post an invalid question", () => {
        component.onAddQuesFormSubmit();

        expect(questionService.postQuestion).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should save a question and navigate back to the quiz questions", () => {
        component.question = { ...validQuestion };
        fixture.detectChanges();

        component.onAddQuesFormSubmit();

        expect(questionService.postQuestion).toHaveBeenCalledWith(component.question);
        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", title: "Question Post" }));
        expect(router.navigate).toHaveBeenCalledWith(["/admin/questions/quiz/7/Java Basics"]);
    });

    it("should show an error when saving a question fails", () => {
        questionService.postQuestion.mockReturnValue(throwError(() => new Error("post failed")));
        component.question = { ...validQuestion };
        fixture.detectChanges();

        component.onAddQuesFormSubmit();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: expect.stringContaining("7") })
        );
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
