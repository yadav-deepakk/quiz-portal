import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { UpdateQuizComponent } from "./update-quiz.component";
import { QuizService } from "@app/services/quiz.service";
import { CategoryService } from "@app/services/category.service";
import { QuizModel } from "@app/models/quiz";
import { CategoryModel } from "@app/models/category";

describe("UpdateQuizComponent", () => {
    let component: UpdateQuizComponent;
    let fixture: ComponentFixture<UpdateQuizComponent>;
    let router: Router;
    let snackBar: MatSnackBar;
    let quizService: {
        getQuizById: ReturnType<typeof vi.fn>;
        updateQuiz: ReturnType<typeof vi.fn>;
    };
    let categoryService: { getCategories: ReturnType<typeof vi.fn> };

    const categories: CategoryModel[] = [{ categoryId: 1, categoryTitle: "Java" }];
    const quiz: QuizModel = {
        quizId: 3,
        quizTitle: "Java Basics",
        quizDescription: "Basic Java",
        questionCount: 2,
        quizMaxMarks: 10,
        isActiveQuiz: true,
        category: { categoryId: 1, categoryTitle: "Java" },
    };

    beforeEach(() => {
        quizService = {
            getQuizById: vi.fn().mockReturnValue(of(quiz)),
            updateQuiz: vi.fn().mockReturnValue(of(quiz)),
        };
        categoryService = { getCategories: vi.fn().mockReturnValue(of(categories)) };

        TestBed.configureTestingModule({
            imports: [UpdateQuizComponent],
            providers: [
                provideRouter([]),
                { provide: QuizService, useValue: quizService },
                { provide: CategoryService, useValue: categoryService },
                { provide: ActivatedRoute, useValue: { snapshot: { params: { quizId: 3 } } } },
            ],
        });
        fixture = TestBed.createComponent(UpdateQuizComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");
        router = TestBed.inject(Router);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create, read the quiz id and load quiz data and categories", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.quizId).toBe(3);
        expect(quizService.getQuizById).toHaveBeenCalledWith(3);
        expect(component.quiz).toEqual(quiz);
        expect(categoryService.getCategories).toHaveBeenCalled();
        expect(component.allCategories).toEqual(categories);
    });

    it("should not load quiz data when no quiz id is present", () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [UpdateQuizComponent],
            providers: [
                provideRouter([]),
                { provide: QuizService, useValue: quizService },
                { provide: CategoryService, useValue: categoryService },
                { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
            ],
        });
        fixture = TestBed.createComponent(UpdateQuizComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");

        fixture.detectChanges();

        expect(quizService.getQuizById).not.toHaveBeenCalled();
        expect(categoryService.getCategories).toHaveBeenCalled();
    });

    it("should show an error when quiz data cannot be loaded", () => {
        quizService.getQuizById.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Error in obtaining data of quiz to be updated" })
        );
    });

    it("should show an error when categories cannot be loaded", () => {
        categoryService.getCategories.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Categories Fetch" })
        );
    });

    it("should require a category before submitting", () => {
        expect(component.validateUpdateQuizForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Category must not be null.", "OK", { duration: 2500 });
    });

    it("should accept a quiz with a category", () => {
        component.quiz = { ...quiz };

        expect(component.validateUpdateQuizForm()).toBe(true);
    });

    it("should not update an invalid quiz", () => {
        component.onUpdateFormSubmit();

        expect(quizService.updateQuiz).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should update a quiz, show success and navigate to the quiz list", async () => {
        component.quiz = { ...quiz };

        component.onUpdateFormSubmit();
        await Promise.resolve();

        expect(quizService.updateQuiz).toHaveBeenCalledWith(quiz);
        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", title: "Quiz Update" }));
        expect(router.navigate).toHaveBeenCalledWith(["/admin/quiz"]);
    });

    it("should show an error when the update response has no quiz id", () => {
        quizService.updateQuiz.mockReturnValue(of({ quizTitle: "Java Basics", category: { categoryId: 1 } }));
        component.quiz = { ...quiz };

        component.onUpdateFormSubmit();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Error Occured in upadating Quiz" })
        );
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should show an error when updating fails", () => {
        quizService.updateQuiz.mockReturnValue(throwError(() => new Error("update failed")));
        component.quiz = { ...quiz };

        component.onUpdateFormSubmit();

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", title: "Update Quiz" }));
    });
});
