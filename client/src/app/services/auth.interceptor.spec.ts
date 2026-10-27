import { TestBed } from "@angular/core/testing";
import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

import { AuthService } from "./auth.service";
import { jwtAuthInterceptor } from "./auth.interceptor";

describe("jwtAuthInterceptor", () => {
    let http: HttpClient;
    let httpTesting: HttpTestingController;
    let authService: AuthService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [provideHttpClient(withInterceptors([jwtAuthInterceptor])), provideHttpClientTesting()],
        });
        http = TestBed.inject(HttpClient);
        httpTesting = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(AuthService);
    });

    afterEach(() => {
        httpTesting.verify();
        localStorage.clear();
    });

    it("should add the authorization header when a jwt is saved", () => {
        authService.saveJwt("sample-jwt");

        http.get("/api/test").subscribe();

        const req = httpTesting.expectOne("/api/test");
        expect(req.request.headers.get("Authorization")).toBe("Bearer sample-jwt");
        req.flush({});
    });

    it("should leave the request untouched when no jwt is saved", () => {
        http.get("/api/test").subscribe();

        const req = httpTesting.expectOne("/api/test");
        expect(req.request.headers.has("Authorization")).toBe(false);
        req.flush({});
    });
});
