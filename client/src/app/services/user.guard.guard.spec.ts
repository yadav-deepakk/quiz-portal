import { TestBed } from "@angular/core/testing";
import { Router, UrlTree, provideRouter } from "@angular/router";

import { AvailableRoutes } from "../app.enum";
import { AuthService } from "./auth.service";
import { adminUserGuard, nonLoggedInUserGuard, normalUserGuard } from "./user.guard.guard";

describe("user guards", () => {
    let router: Router;
    let authService: {
        checkUserHasRole: ReturnType<typeof vi.fn>;
        isUserLoggedIn: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        authService = {
            checkUserHasRole: vi.fn().mockReturnValue(false),
            isUserLoggedIn: vi.fn().mockReturnValue(false),
        };

        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
        });
        router = TestBed.inject(Router);
    });

    function run(guard: typeof adminUserGuard): unknown {
        return TestBed.runInInjectionContext(() => (guard as () => unknown)());
    }

    function redirectedTo(result: unknown): string {
        return router.serializeUrl(result as UrlTree);
    }

    describe("adminUserGuard", () => {
        it("allows an admin user", () => {
            authService.checkUserHasRole.mockImplementation((role: string) => role === "ADMIN");

            expect(run(adminUserGuard)).toBe(true);
        });

        it("redirects a normal user to the user dashboard", () => {
            authService.checkUserHasRole.mockImplementation((role: string) => role === "NORMAL");

            const result = run(adminUserGuard);

            expect(result).toBeInstanceOf(UrlTree);
            expect(redirectedTo(result)).toBe(`/${AvailableRoutes.UserDashboard}`);
        });

        it("redirects a non logged in user to login", () => {
            authService.isUserLoggedIn.mockReturnValue(false);

            const result = run(adminUserGuard);

            expect(redirectedTo(result)).toBe(`/${AvailableRoutes.Login}`);
        });

        it("blocks a logged in user without a known role", () => {
            authService.isUserLoggedIn.mockReturnValue(true);

            expect(run(adminUserGuard)).toBe(false);
        });
    });

    describe("normalUserGuard", () => {
        it("allows a normal user", () => {
            authService.checkUserHasRole.mockImplementation((role: string) => role === "NORMAL");

            expect(run(normalUserGuard)).toBe(true);
        });

        it("redirects an admin to the admin dashboard", () => {
            authService.checkUserHasRole.mockImplementation((role: string) => role === "ADMIN");

            const result = run(normalUserGuard);

            expect(redirectedTo(result)).toBe(`/${AvailableRoutes.AdminDashboard}`);
        });

        it("redirects a non logged in user to login", () => {
            const result = run(normalUserGuard);

            expect(redirectedTo(result)).toBe(`/${AvailableRoutes.Login}`);
        });

        it("blocks a logged in user without a known role", () => {
            authService.isUserLoggedIn.mockReturnValue(true);

            expect(run(normalUserGuard)).toBe(false);
        });
    });

    describe("nonLoggedInUserGuard", () => {
        it("allows a non logged in user", () => {
            expect(run(nonLoggedInUserGuard)).toBe(true);
        });

        it("redirects a logged in admin to the admin dashboard", () => {
            authService.isUserLoggedIn.mockReturnValue(true);
            authService.checkUserHasRole.mockImplementation((role: string) => role === "ADMIN");

            const result = run(nonLoggedInUserGuard);

            expect(redirectedTo(result)).toBe(`/${AvailableRoutes.AdminDashboard}`);
        });

        it("redirects a logged in normal user to the user dashboard", () => {
            authService.isUserLoggedIn.mockReturnValue(true);
            authService.checkUserHasRole.mockImplementation((role: string) => role === "NORMAL");

            const result = run(nonLoggedInUserGuard);

            expect(redirectedTo(result)).toBe(`/${AvailableRoutes.UserDashboard}`);
        });

        it("blocks a logged in user without a known role", () => {
            authService.isUserLoggedIn.mockReturnValue(true);

            expect(run(nonLoggedInUserGuard)).toBe(false);
        });
    });
});
