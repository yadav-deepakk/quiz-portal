import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { AddCategoryComponent } from "./add-category.component";
import { CategoryService } from "@app/services/category.service";
import { CategoryModel } from "@app/models/category";

describe("AddCategoryComponent", () => {
    let component: AddCategoryComponent;
    let fixture: ComponentFixture<AddCategoryComponent>;
    let snackBar: MatSnackBar;
    let categoryService: { postCategory: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        categoryService = { postCategory: vi.fn().mockReturnValue(of({ categoryId: 1 })) };

        TestBed.configureTestingModule({
            imports: [AddCategoryComponent],
            providers: [{ provide: CategoryService, useValue: categoryService }],
        });
        fixture = TestBed.createComponent(AddCategoryComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create and render the form", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(fixture.nativeElement.querySelector("form")).toBeTruthy();
        expect(component.categoryFormData).toEqual({ categoryTitle: "", categoryDescription: "" });
    });

    it("should reject a missing category title", () => {
        expect(component.validateAddCategoryForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Please enter a category title", "OK", { duration: 3000 });
    });

    it("should reject a blank category title", () => {
        component.categoryFormData.categoryTitle = "   ";

        expect(component.validateAddCategoryForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalled();
    });

    it("should accept a category with a title", () => {
        component.categoryFormData = { categoryTitle: "Java", categoryDescription: "Java quizzes" };

        expect(component.validateAddCategoryForm()).toBe(true);
    });

    it("should accept a category without a description", () => {
        component.categoryFormData = { categoryTitle: "Java" };

        expect(component.validateAddCategoryForm()).toBe(true);
    });

    it("should not submit an invalid form", () => {
        component.onAddCategoryFormSubmit();

        expect(categoryService.postCategory).not.toHaveBeenCalled();
        expect(Swal.fire).not.toHaveBeenCalled();
    });

    it("should save a category, show success and reset the form", () => {
        const category: CategoryModel = { categoryTitle: "Java", categoryDescription: "Java quizzes" };
        let submitted: CategoryModel | undefined;
        categoryService.postCategory.mockImplementation((data: CategoryModel) => {
            submitted = { ...data };
            return of({ categoryId: 1 });
        });
        component.categoryFormData = { ...category };

        component.onAddCategoryFormSubmit();

        expect(categoryService.postCategory).toHaveBeenCalled();
        expect(submitted).toEqual(category);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "success", title: "Category saved successfully." })
        );
        expect(component.categoryFormData).toEqual({ categoryTitle: "", categoryDescription: "" });
    });

    it("should show an error when saving fails", () => {
        categoryService.postCategory.mockReturnValue(throwError(() => new Error("save failed")));
        component.categoryFormData = { categoryTitle: "Java" };

        component.onAddCategoryFormSubmit();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", titleText: "error in saving category." })
        );
    });

    it("should submit through the template", () => {
        component.categoryFormData = { categoryTitle: "Java" };
        fixture.detectChanges();

        fixture.nativeElement.querySelector("form").dispatchEvent(new Event("submit"));

        expect(categoryService.postCategory).toHaveBeenCalled();
    });
});
