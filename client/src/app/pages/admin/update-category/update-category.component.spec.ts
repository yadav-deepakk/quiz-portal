import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { UpdateCategoryComponent } from "./update-category.component";
import { CategoryService } from "@app/services/category.service";
import { CategoryModel } from "@app/models/category";

describe("UpdateCategoryComponent", () => {
    let component: UpdateCategoryComponent;
    let fixture: ComponentFixture<UpdateCategoryComponent>;
    let router: Router;
    let snackBar: MatSnackBar;
    let categoryService: {
        getCategoryById: ReturnType<typeof vi.fn>;
        updateCategory: ReturnType<typeof vi.fn>;
    };

    const category: CategoryModel = { categoryId: 4, categoryTitle: "Java", categoryDescription: "Java quizzes" };

    beforeEach(() => {
        categoryService = {
            getCategoryById: vi.fn().mockReturnValue(of(category)),
            updateCategory: vi.fn().mockReturnValue(of(category)),
        };

        TestBed.configureTestingModule({
            imports: [UpdateCategoryComponent],
            providers: [
                provideRouter([]),
                { provide: CategoryService, useValue: categoryService },
                { provide: ActivatedRoute, useValue: { snapshot: { params: { categoryId: 4 } } } },
            ],
        });
        fixture = TestBed.createComponent(UpdateCategoryComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");
        router = TestBed.inject(Router);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create, read the category id and load the category", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.categoryIdRouteParam).toBe(4);
        expect(categoryService.getCategoryById).toHaveBeenCalledWith(4);
        expect(component.categoryData).toEqual(category);
        expect(fixture.nativeElement.textContent).toContain("Update category");
    });

    it("should not load a category when no id is present", () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [UpdateCategoryComponent],
            providers: [
                provideRouter([]),
                { provide: CategoryService, useValue: categoryService },
                { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
            ],
        });
        fixture = TestBed.createComponent(UpdateCategoryComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snack;
        vi.spyOn(snackBar, "open");

        fixture.detectChanges();

        expect(categoryService.getCategoryById).not.toHaveBeenCalled();
        expect(component.categoryData).toBeNull();
    });

    it("should show an error when the category cannot be loaded", () => {
        categoryService.getCategoryById.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Category Data" })
        );
    });

    it("should reject a missing category title", () => {
        component.categoryData = null;

        expect(component.validateUpdateCategoryForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Please enter a category title", "OK", { duration: 3000 });
    });

    it("should reject a blank category title", () => {
        component.categoryData = { categoryId: 4, categoryTitle: "   " };

        expect(component.validateUpdateCategoryForm()).toBe(false);
    });

    it("should accept a valid category", () => {
        component.categoryData = { ...category };

        expect(component.validateUpdateCategoryForm()).toBe(true);
    });

    it("should accept a category without a description", () => {
        component.categoryData = { categoryId: 4, categoryTitle: "Java" };

        expect(component.validateUpdateCategoryForm()).toBe(true);
    });

    it("should not update an invalid form", () => {
        component.categoryData = null;

        component.onUpdateCategoryFormSubmit();

        expect(categoryService.updateCategory).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should update a category, show success and navigate to the category list", async () => {
        component.categoryData = { ...category };

        component.onUpdateCategoryFormSubmit();
        await Promise.resolve();

        expect(categoryService.updateCategory).toHaveBeenCalledWith(category);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "success", title: "Category Update" })
        );
        expect(router.navigate).toHaveBeenCalledWith(["admin/category"]);
    });

    it("should not show success when the update response has no category id", async () => {
        categoryService.updateCategory.mockReturnValue(of({ categoryTitle: "Java" }));
        component.categoryData = { ...category };

        component.onUpdateCategoryFormSubmit();
        await Promise.resolve();

        expect(router.navigate).not.toHaveBeenCalled();
        expect(Swal.fire).not.toHaveBeenCalled();
    });

    it("should show an error when updating fails", () => {
        categoryService.updateCategory.mockReturnValue(throwError(() => new Error("update failed")));
        component.categoryData = { ...category };

        component.onUpdateCategoryFormSubmit();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Category Update" })
        );
    });
});
