import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { UserSidebarComponent } from "./user-sidebar.component";
import { CategoryService } from "@app/services/category.service";
import { CategoryModel } from "@app/models/category";

describe("UserSidebarComponent", () => {
    let component: UserSidebarComponent;
    let fixture: ComponentFixture<UserSidebarComponent>;
    let categoryService: { getCategories: ReturnType<typeof vi.fn> };

    const categories: CategoryModel[] = [{ categoryId: 1, categoryTitle: "Java" }];

    beforeEach(() => {
        categoryService = { getCategories: vi.fn().mockReturnValue(of(categories)) };

        TestBed.configureTestingModule({
            imports: [UserSidebarComponent],
            providers: [provideRouter([]), { provide: CategoryService, useValue: categoryService }],
        });
        fixture = TestBed.createComponent(UserSidebarComponent);
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
    });

    it("should show an error when categories cannot be loaded", () => {
        categoryService.getCategories.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Categories Retreival" })
        );
    });
});
