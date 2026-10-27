import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { QuizComponent } from "./quiz.component";
import { QuizService } from "@app/services/quiz.service";
import { CategoryService } from "@app/services/category.service";
import { QuizModel } from "@app/models/quiz";

describe("QuizComponent", () => {
    let component: QuizComponent;
    let fixture: ComponentFixture<QuizComponent>;
    let quizService: { getAllQuiz: ReturnType<typeof vi.fn>; deleteQuizById: ReturnType<typeof vi.fn> };

    const quizzes: QuizModel[] = [
        {
            quizId: 1,
            quizTitle: "Java Basics",
            quizDescription: "Basic Java",
            questionCount: 2,
            quizMaxMarks: 10,
            isActiveQuiz: true,
            category: { categoryId: 1, categoryTitle: "Java" },
        },
        {
            quizId: 2,
            quizTitle: "Spring",
            quizDescription: "Spring basics",
            questionCount: 3,
            quizMaxMarks: 15,
            isActiveQuiz: false,
            category: { categoryId: 2, categoryTitle: "Spring" },
        },
    ];

    beforeEach(() => {
        quizService = {
            getAllQuiz: vi.fn().mockReturnValue(of(quizzes)),
            deleteQuizById: vi.fn().mockReturnValue(of(true)),
        };

        TestBed.configureTestingModule({
            imports: [QuizComponent],
            providers: [
                provideRouter([]),
                { provide: QuizService, useValue: quizService },
                { provide: CategoryService, useValue: { getCategories: vi.fn().mockReturnValue(of([])) } },
            ],
        });
        fixture = TestBed.createComponent(QuizComponent);
        component = fixture.componentInstance;
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create and load quizzes", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(quizService.getAllQuiz).toHaveBeenCalled();
        expect(component.quizzes).toEqual(quizzes);
        expect(fixture.nativeElement.textContent).toContain("JAVA BASICS");
        expect(fixture.nativeElement.textContent).toContain("SPRING");
    });

    it("should show an error when quizzes cannot be loaded", () => {
        quizService.getAllQuiz.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Error in loading quizzes." })
        );
    });

    it("should ignore deletion without a quiz id", () => {
        component.deleteQuiz(undefined);

        expect(Swal.fire).not.toHaveBeenCalled();
        expect(quizService.deleteQuizById).not.toHaveBeenCalled();
    });

    it("should delete a quiz after confirmation and remove it from the list", async () => {
        fixture.detectChanges();

        component.deleteQuiz(1);
        await Promise.resolve();

        expect(quizService.deleteQuizById).toHaveBeenCalledWith(1);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "success", title: "Quiz Delete" })
        );
        expect(component.quizzes).toEqual([quizzes[1]]);
    });

    it("should show an error when deletion fails", async () => {
        quizService.deleteQuizById.mockReturnValue(throwError(() => new Error("delete failed")));
        fixture.detectChanges();

        component.deleteQuiz(1);
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Some problem occured in deletion." })
        );
    });

    it("should not delete when the confirmation is dismissed", async () => {
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: false, isDenied: false, isDismissed: true } as any);
        fixture.detectChanges();

        component.deleteQuiz(1);
        await Promise.resolve();

        expect(quizService.deleteQuizById).not.toHaveBeenCalled();
    });
});
