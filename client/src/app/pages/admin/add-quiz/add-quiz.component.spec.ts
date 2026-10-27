import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { AddQuizComponent } from "./add-quiz.component";
import { CategoryService } from "@app/services/category.service";
import { QuizService } from "@app/services/quiz.service";
import { CategoryModel } from "@app/models/category";
import { QuizModel } from "@app/models/quiz";

describe("AddQuizComponent", () => {
    let component: AddQuizComponent;
    let fixture: ComponentFixture<AddQuizComponent>;
    let router: Router;
    let snackBar: MatSnackBar;
    let quizService: { postQuiz: ReturnType<typeof vi.fn> };
    let categoryService: { getCategories: ReturnType<typeof vi.fn> };

    const categories: CategoryModel[] = [{ categoryId: 1, categoryTitle: "Java" }];

    beforeEach(() => {
        quizService = { postQuiz: vi.fn().mockReturnValue(of({ quizId: 1 })) };
        categoryService = { getCategories: vi.fn().mockReturnValue(of(categories)) };

        TestBed.configureTestingModule({
            imports: [AddQuizComponent],
            providers: [
                provideRouter([]),
                { provide: QuizService, useValue: quizService },
                { provide: CategoryService, useValue: categoryService },
            ],
        });
        fixture = TestBed.createComponent(AddQuizComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");
        router = TestBed.inject(Router);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create and load the categories", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(categoryService.getCategories).toHaveBeenCalled();
        expect(component.categories).toEqual(categories);
        expect(fixture.nativeElement.textContent).toContain("Add a new quiz");
    });

    it("should show an error when categories cannot be loaded", () => {
        categoryService.getCategories.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Error in recieving categories." })
        );
    });

    it("should require a category before submitting", () => {
        expect(component.validateForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Category must not be null.", "OK", { duration: 2500 });
    });

    it("should accept a form with a category", () => {
        component.category.categoryId = 1;

        expect(component.validateForm()).toBe(true);
    });

    it("should not submit an invalid form", () => {
        component.onAddQuizFormSubmit();

        expect(quizService.postQuiz).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should save a quiz and navigate to the quiz list", () => {
        const quiz: QuizModel = { quizTitle: "Java Basics", category: { categoryId: 1 } };
        component.quizFormData = { ...quiz };

        component.onAddQuizFormSubmit();

        expect(quizService.postQuiz).toHaveBeenCalledWith(quiz);
        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Quiz Saved" }));
        expect(router.navigate).toHaveBeenCalledWith(["/admin/quiz"]);
    });

    it("should show an error when saving a quiz fails", () => {
        quizService.postQuiz.mockReturnValue(throwError(() => new Error("save failed")));
        component.quizFormData = { quizTitle: "Java Basics", category: { categoryId: 1 } };

        component.onAddQuizFormSubmit();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Error in saving Quiz." })
        );
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should submit through the template", () => {
        component.quizFormData = { quizTitle: "Java Basics", category: { categoryId: 1 } };
        fixture.detectChanges();

        fixture.nativeElement.querySelector("form").dispatchEvent(new Event("submit"));

        expect(quizService.postQuiz).toHaveBeenCalled();
    });
});
