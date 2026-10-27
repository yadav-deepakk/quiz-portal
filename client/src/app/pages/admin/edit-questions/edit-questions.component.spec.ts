import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { EditQuestionsComponent } from "./edit-questions.component";
import { QuestionService } from "@app/services/question.service";
import { QuestionModel } from "@app/models/question";

describe("EditQuestionsComponent", () => {
    let component: EditQuestionsComponent;
    let fixture: ComponentFixture<EditQuestionsComponent>;
    let router: Router;
    let snackBar: MatSnackBar;
    let questionService: {
        getQuestionById: ReturnType<typeof vi.fn>;
        updateQuestion: ReturnType<typeof vi.fn>;
    };

    const question: QuestionModel = {
        questionId: 11,
        questionContent: "What is 2 + 2?",
        option1: "2",
        option2: "3",
        option3: "4",
        option4: "5",
        answer: "4",
        quiz: { quizId: 7, quizTitle: "Java Basics", category: {} },
    };

    beforeEach(() => {
        questionService = {
            getQuestionById: vi.fn().mockReturnValue(of(question)),
            updateQuestion: vi.fn().mockReturnValue(of(question)),
        };

        TestBed.configureTestingModule({
            imports: [EditQuestionsComponent],
            providers: [
                provideRouter([]),
                { provide: QuestionService, useValue: questionService },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { params: { quizId: 7, quizTitle: "Java Basics", questionId: 11 } } },
                },
            ],
        });
        fixture = TestBed.createComponent(EditQuestionsComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");
        router = TestBed.inject(Router);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create, read route parameters and load the question", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.quizIdQueryParam).toBe(7);
        expect(component.quizTitleQueryParam).toBe("Java Basics");
        expect(component.questionIdQueryParam).toBe(11);
        expect(questionService.getQuestionById).toHaveBeenCalledWith(11);
        expect(component.question).toEqual(question);
    });

    it("should show an error when the question cannot be loaded", () => {
        questionService.getQuestionById.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Question Get" })
        );
    });

    it("should warn when no question id is available", () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [EditQuestionsComponent],
            providers: [
                provideRouter([]),
                { provide: QuestionService, useValue: questionService },
                { provide: ActivatedRoute, useValue: { snapshot: { params: { quizId: 7 } } } },
            ],
        });
        fixture = TestBed.createComponent(EditQuestionsComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");

        fixture.detectChanges();

        expect(questionService.getQuestionById).not.toHaveBeenCalled();
        expect(snackBar.open).toHaveBeenCalledWith("Error in getting question Id", "OK", { duration: 2400 });
    });

    it("should reject incomplete question data", () => {
        expect(component.validateForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Fields are mandatory!", "OK", { duration: 2400 });
    });

    it("should reject blank option data", () => {
        component.question = { ...question, option2: "   " };

        expect(component.validateForm()).toBe(false);
    });

    it("should accept a complete question", () => {
        component.question = { ...question };

        expect(component.validateForm()).toBe(true);
    });

    it("should not update an invalid question", () => {
        component.updateQuestion();

        expect(questionService.updateQuestion).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should update a question and navigate back", () => {
        component.question = { ...question };
        fixture.detectChanges();

        component.updateQuestion();

        expect(questionService.updateQuestion).toHaveBeenCalledWith(question);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "success", title: "Question Update" })
        );
        expect(router.navigate).toHaveBeenCalledWith(["/admin/questions/quiz/7/Java Basics"]);
    });

    it("should show an error when the update response has no question id", () => {
        questionService.updateQuestion.mockReturnValue(of({ ...question, questionId: undefined }));
        component.question = { ...question };
        fixture.detectChanges();

        component.updateQuestion();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Error Received in updating the question." })
        );
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should show an error when updating fails", () => {
        questionService.updateQuestion.mockReturnValue(throwError(() => new Error("update failed")));
        component.question = { ...question };
        fixture.detectChanges();

        component.updateQuestion();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Question Update" })
        );
    });
});
