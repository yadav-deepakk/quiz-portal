import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { ViewCategoriesComponent } from "./view-categories.component";
import { CategoryService } from "@app/services/category.service";
import { CategoryModel } from "@app/models/category";

describe("ViewCategoriesComponent", () => {
    let component: ViewCategoriesComponent;
    let fixture: ComponentFixture<ViewCategoriesComponent>;
    let categoryService: {
        getCategories: ReturnType<typeof vi.fn>;
        deleteCategory: ReturnType<typeof vi.fn>;
    };

    const categories: CategoryModel[] = [
        { categoryId: 1, categoryTitle: "Java", categoryDescription: "Java quizzes" },
        { categoryId: 2, categoryTitle: "Spring", categoryDescription: "Spring quizzes" },
    ];

    beforeEach(() => {
        categoryService = {
            getCategories: vi.fn().mockReturnValue(of(categories)),
            deleteCategory: vi.fn().mockReturnValue(of(true)),
        };

        TestBed.configureTestingModule({
            imports: [ViewCategoriesComponent],
            providers: [
                provideRouter([]),
                { provide: CategoryService, useValue: categoryService },
            ],
        });
        fixture = TestBed.createComponent(ViewCategoriesComponent);
        component = fixture.componentInstance;
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create and load categories", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(categoryService.getCategories).toHaveBeenCalled();
        expect(component.categories).toEqual(categories);
        expect(fixture.nativeElement.textContent).toContain("Java");
        expect(fixture.nativeElement.textContent).toContain("Spring");
    });

    it("should show an error when categories cannot be loaded", () => {
        categoryService.getCategories.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Unable to load all categories, Something went wrong!" })
        );
    });

    it("should ignore deletion without an id", () => {
        component.deleteCategory(undefined, "Java");

        expect(Swal.fire).not.toHaveBeenCalled();
        expect(categoryService.deleteCategory).not.toHaveBeenCalled();
    });

    it("should delete a category after confirmation and remove it from the list", async () => {
        fixture.detectChanges();

        component.deleteCategory(1, "Java");
        await Promise.resolve();

        expect(categoryService.deleteCategory).toHaveBeenCalledWith(1);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "success", text: "Deletion Successful." })
        );
        expect(component.categories).toEqual([categories[1]]);
    });

    it("should show an error when deletion returns false", async () => {
        categoryService.deleteCategory.mockReturnValue(of(false));
        fixture.detectChanges();

        component.deleteCategory(1, "Java");
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Category Deletion Unsuccesful" })
        );
    });

    it("should show an error when deletion fails", async () => {
        categoryService.deleteCategory.mockReturnValue(throwError(() => new Error("delete failed")));
        fixture.detectChanges();

        component.deleteCategory(1, "Java");
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", text: "Something went wrong!" })
        );
    });

    it("should not delete when the confirmation is dismissed", async () => {
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: false, isDenied: false, isDismissed: true } as any);
        fixture.detectChanges();

        component.deleteCategory(1, "Java");
        await Promise.resolve();

        expect(categoryService.deleteCategory).not.toHaveBeenCalled();
    });
});
