import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

import { CategoryService } from "./category.service";
import { CategoryModel } from "../models/category";

const baseUrl = "http://localhost:8080/category";
const category: CategoryModel = { categoryId: 4, categoryTitle: "Java", categoryDescription: "Java quiz" };

describe("CategoryService", () => {
    let service: CategoryService;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(CategoryService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should create a category", () => {
        service.postCategory(category).subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(category);
        req.flush(category);
    });

    it("should fetch a category by id", () => {
        service.getCategoryById(4).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/4`);
        expect(req.request.method).toBe("GET");
        req.flush(category);
    });

    it("should fetch all categories", () => {
        service.getCategories().subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush([category]);
    });

    it("should update a category", () => {
        service.updateCategory(category).subscribe();

        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe("PUT");
        expect(req.request.body).toEqual(category);
        req.flush(category);
    });

    it("should delete a category", () => {
        service.deleteCategory(4).subscribe();

        const req = httpTesting.expectOne(`${baseUrl}/4`);
        expect(req.request.method).toBe("DELETE");
        req.flush(true);
    });
});
