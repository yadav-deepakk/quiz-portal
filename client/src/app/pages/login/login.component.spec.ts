import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { LoginComponent } from "./login.component";
import { AuthService } from "@app/services/auth.service";
import { AvailableRoutes, UserRolesEnum } from "@app/app.enum";
import { UserDetail } from "@app/models/user";

const user: UserDetail = {
    userId: 1,
    firstName: "Deepak",
    lastName: "Yadav",
    username: "yadav_deepakk",
    email: "deepak@example.com",
    profile: "default.png",
    phone: "9999999999",
    isActive: true,
    enabled: true,
    credentialsNonExpired: true,
    accountNonExpired: true,
    accountNonLocked: true,
    authorities: [{ authority: "ADMIN" }],
};

describe("LoginComponent", () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let router: Router;
    let snackBar: MatSnackBar;
    let authService: {
        logInUser: ReturnType<typeof vi.fn>;
        getCurrentUser: ReturnType<typeof vi.fn>;
        saveJwt: ReturnType<typeof vi.fn>;
        saveUser: ReturnType<typeof vi.fn>;
        checkUserHasRole: ReturnType<typeof vi.fn>;
        loginStatusSubject: Subject<boolean>;
    };

    beforeEach(() => {
        authService = {
            logInUser: vi.fn().mockReturnValue(of({ username: user.username, jwt: "jwt-token" })),
            getCurrentUser: vi.fn().mockReturnValue(of(user)),
            saveJwt: vi.fn(),
            saveUser: vi.fn(),
            checkUserHasRole: vi.fn().mockImplementation((role: string) => role === UserRolesEnum.ADMIN),
            loginStatusSubject: new Subject<boolean>(),
        };

        TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
        });
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snackBar;
        vi.spyOn(snackBar, "open");
        router = TestBed.inject(Router);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create and render the login form", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(fixture.nativeElement.querySelector("form")).toBeTruthy();
        expect(component.loginFormData).toEqual({ username: "", password: "" });
    });

    it("should toggle password visibility", () => {
        fixture.detectChanges();
        const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="password"]');
        expect(component.hidePassword).toBe(true);
        expect(passwordInput.type).toBe("password");

        fixture.nativeElement.querySelector("button[matSuffix]").click();
        fixture.detectChanges();

        expect(component.hidePassword).toBe(false);
        expect(passwordInput.type).toBe("text");
    });

    it("should reject empty credentials", () => {
        expect(component.validateLoginForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("All Fields are mandatory.", "OK", { duration: 5000 });
    });

    it("should reject null credentials", () => {
        component.loginFormData.username = null as any;

        expect(component.validateLoginForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("All Fields are mandatory.", "OK", { duration: 5000 });
    });

    it("should reject an invalid username", () => {
        component.loginFormData = { username: "ab", password: "Password1!" };

        expect(component.validateLoginForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Username should be 3 to 255 characters long.", "OK", {
            duration: 5000,
        });
    });

    it("should reject a short password", () => {
        component.loginFormData = { username: "valid_user", password: "12345" };

        expect(component.validateLoginForm()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Password must be 6 to 255 characters long.", "OK", {
            duration: 3000,
        });
    });

    it("should reject a password that is too long", () => {
        component.loginFormData = { username: "valid_user", password: "a".repeat(256) };

        expect(component.validateLoginForm()).toBe(false);
    });

    it("should accept valid credentials", () => {
        component.loginFormData = { username: "valid_user", password: "Password1!" };

        expect(component.validateLoginForm()).toBe(true);
    });

    it("should log in an admin and redirect to the admin dashboard", () => {
        component.loginFormData = { username: "yadav_deepakk", password: "Password1!" };

        component.onLoginFormSubmit();

        expect(authService.logInUser).toHaveBeenCalledWith(component.loginFormData);
        expect(authService.saveJwt).toHaveBeenCalledWith("jwt-token");
        expect(authService.saveUser).toHaveBeenCalledWith(user);
        expect(router.navigate).toHaveBeenCalledWith([AvailableRoutes.AdminDashboard]);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ title: "Success", icon: "success" })
        );
    });

    it("should log in a normal user and redirect to the user dashboard", () => {
        authService.checkUserHasRole.mockImplementation((role: string) => role === UserRolesEnum.NORMAL);
        component.loginFormData = { username: "normal_user", password: "Password1!" };

        component.onLoginFormSubmit();

        expect(router.navigate).toHaveBeenCalledWith([AvailableRoutes.UserDashboard]);
    });

    it("should not redirect when the current user has no known role", () => {
        authService.checkUserHasRole.mockReturnValue(false);
        component.loginFormData = { username: "unknown_user", password: "Password1!" };

        component.onLoginFormSubmit();

        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should handle an error while fetching the current user", () => {
        authService.getCurrentUser.mockReturnValue(throwError(() => new Error("current user failed")));
        component.loginFormData = { username: "yadav_deepakk", password: "Password1!" };

        expect(() => component.onLoginFormSubmit()).not.toThrow();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should show an error dialog when login fails", () => {
        authService.logInUser.mockReturnValue(throwError(() => new Error("login failed")));
        component.loginFormData = { username: "yadav_deepakk", password: "Password1!" };

        component.onLoginFormSubmit();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Error in user login" })
        );
        expect(authService.saveJwt).not.toHaveBeenCalled();
    });

    it("should submit the form through the template", () => {
        component.loginFormData = { username: "yadav_deepakk", password: "Password1!" };
        fixture.detectChanges();

        fixture.nativeElement.querySelector("form").dispatchEvent(new Event("submit"));

        expect(authService.logInUser).toHaveBeenCalled();
    });
});
