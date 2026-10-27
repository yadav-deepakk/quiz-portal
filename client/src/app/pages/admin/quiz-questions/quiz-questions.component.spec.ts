import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { QuizQuestionsComponent } from "./quiz-questions.component";
import { QuestionService } from "@app/services/question.service";
import { QuestionModel } from "@app/models/question";

describe("QuizQuestionsComponent", () => {
    let component: QuizQuestionsComponent;
    let fixture: ComponentFixture<QuizQuestionsComponent>;
    let questionService: {
        getAllQuestionOfQuizForAdmin: ReturnType<typeof vi.fn>;
        deleteQuestion: ReturnType<typeof vi.fn>;
    };

    const questions: QuestionModel[] = [
        { questionId: 1, questionContent: "First", option1: "a", option2: "b", option3: "c", option4: "d", answer: "a" },
        { questionId: 2, questionContent: "Second", option1: "a", option2: "b", option3: "c", option4: "d", answer: "b" },
    ];

    beforeEach(() => {
        questionService = {
            getAllQuestionOfQuizForAdmin: vi.fn().mockReturnValue(of(questions)),
            deleteQuestion: vi.fn().mockReturnValue(of(true)),
        };

        TestBed.configureTestingModule({
            imports: [QuizQuestionsComponent],
            providers: [
                provideRouter([]),
                { provide: QuestionService, useValue: questionService },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { params: { quizId: 7, quizTitle: "Java Basics" } } },
                },
            ],
        });
        fixture = TestBed.createComponent(QuizQuestionsComponent);
        component = fixture.componentInstance;
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create, read route params and load questions", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.quizIdQueryParam).toBe(7);
        expect(component.quizTitleQueryParam).toBe("Java Basics");
        expect(questionService.getAllQuestionOfQuizForAdmin).toHaveBeenCalledWith(7);
        expect(component.allQuestionsOfQuiz).toEqual(questions);
        expect(fixture.nativeElement.textContent).toContain("JAVA BASICS");
    });

    it("should not load questions when no quiz id is present", () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [QuizQuestionsComponent],
            providers: [
                provideRouter([]),
                { provide: QuestionService, useValue: questionService },
                { provide: ActivatedRoute, useValue: { snapshot: { params: { quizTitle: "Java Basics" } } } },
            ],
        });
        fixture = TestBed.createComponent(QuizQuestionsComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();

        expect(questionService.getAllQuestionOfQuizForAdmin).not.toHaveBeenCalled();
        expect(component.allQuestionsOfQuiz).toBeNull();
    });

    it("should show an error when questions cannot be loaded", () => {
        questionService.getAllQuestionOfQuizForAdmin.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Questions Fetch" })
        );
    });

    it("should ignore delete calls without an id or content", () => {
        component.deleteQuestion(undefined, "content");
        component.deleteQuestion(1, undefined);

        expect(Swal.fire).not.toHaveBeenCalled();
        expect(questionService.deleteQuestion).not.toHaveBeenCalled();
    });

    it("should delete a question after confirmation and remove it from the list", async () => {
        fixture.detectChanges();

        component.deleteQuestion(1, "First");
        await Promise.resolve();

        expect(questionService.deleteQuestion).toHaveBeenCalledWith(1);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "success", title: "Question Delete" })
        );
        expect(component.allQuestionsOfQuiz).toEqual([questions[1]]);
    });

    it("should show an error when deletion returns false", async () => {
        questionService.deleteQuestion.mockReturnValue(of(false));
        fixture.detectChanges();

        component.deleteQuestion(1, "First");
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Some error in question deletion." })
        );
    });

    it("should show an error when deletion fails", async () => {
        questionService.deleteQuestion.mockReturnValue(throwError(() => new Error("delete failed")));
        fixture.detectChanges();

        component.deleteQuestion(1, "First");
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Question Delete" })
        );
    });

    it("should not delete when the confirmation is dismissed", async () => {
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: false, isDenied: false, isDismissed: true } as any);
        fixture.detectChanges();

        component.deleteQuestion(1, "First");
        await Promise.resolve();

        expect(questionService.deleteQuestion).not.toHaveBeenCalled();
    });
});
