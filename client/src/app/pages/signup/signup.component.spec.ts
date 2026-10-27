import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { SignupComponent } from "./signup.component";
import { AuthService } from "@app/services/auth.service";

describe("SignupComponent", () => {
    let component: SignupComponent;
    let fixture: ComponentFixture<SignupComponent>;
    let snackBar: MatSnackBar;
    let authService: { signUpUser: ReturnType<typeof vi.fn> };

    const validForm = {
        firstName: "Deepak",
        lastName: "Yadav",
        email: "deepak@example.com",
        phone: "9999999999",
        username: "yadav_deepakk",
        password: "Password1!",
    };

    beforeEach(() => {
        authService = { signUpUser: vi.fn().mockReturnValue(of({ username: "yadav_deepakk", jwt: "token" })) };

        TestBed.configureTestingModule({
            imports: [SignupComponent],
            providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
        });
        fixture = TestBed.createComponent(SignupComponent);
        component = fixture.componentInstance;
        snackBar = (component as any).snackBar;
        vi.spyOn(snackBar, "open");
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create and render the sign up form", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(fixture.nativeElement.querySelector("form")).toBeTruthy();
        expect(component.signUpFormData).toEqual({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            username: "",
            password: "",
        });
    });

    it("should toggle password visibility", () => {
        fixture.detectChanges();
        const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="password"]');

        fixture.nativeElement.querySelector("button[matSuffix]").click();
        fixture.detectChanges();

        expect(component.hidePassword).toBe(false);
        expect(passwordInput.type).toBe("text");
    });

    it("should reject empty fields", () => {
        expect(component.doSignUpFormValidation()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("All fields are mandatory to fill!", "OK", { duration: 3000 });
    });

    it("should reject whitespace only fields", () => {
        component.signUpFormData = { ...validForm, firstName: "   " };

        expect(component.doSignUpFormValidation()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("All fields are mandatory to fill!", "OK", { duration: 3000 });
    });

    it("should reject a null field", () => {
        component.signUpFormData = { ...validForm, lastName: null as any };

        expect(component.doSignUpFormValidation()).toBe(false);
    });

    it("should reject an invalid first name", () => {
        component.signUpFormData = { ...validForm, firstName: "Deepak1" };

        expect(component.doSignUpFormValidation()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith(
            expect.stringContaining("First Name"),
            "OK",
            expect.objectContaining({ duration: 5000 })
        );
    });

    it("should reject an invalid last name", () => {
        component.signUpFormData = { ...validForm, lastName: "Yadav1" };

        expect(component.doSignUpFormValidation()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith(expect.stringContaining("Last Name"), "OK", expect.anything());
    });

    it("should reject an invalid email", () => {
        component.signUpFormData = { ...validForm, email: "not-an-email" };

        expect(component.doSignUpFormValidation()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Enter a valid email!", "OK", { duration: 3000 });
    });

    it("should reject an invalid phone number", () => {
        component.signUpFormData = { ...validForm, phone: "12345" };

        expect(component.doSignUpFormValidation()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith("Enter a phone number of 10 digits!", "OK", { duration: 4000 });
    });

    it("should reject an invalid username", () => {
        component.signUpFormData = { ...validForm, username: "ab" };

        expect(component.doSignUpFormValidation()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith(expect.stringContaining("Username"), "OK", expect.anything());
    });

    it("should reject a weak password", () => {
        component.signUpFormData = { ...validForm, password: "abcdef" };

        expect(component.doSignUpFormValidation()).toBe(false);
        expect(snackBar.open).toHaveBeenCalledWith(expect.stringContaining("Password"), "OK", expect.anything());
    });

    it("should reject a password without a special character", () => {
        component.signUpFormData = { ...validForm, password: "Password1" };

        expect(component.doSignUpFormValidation()).toBe(false);
    });

    it("should accept a valid form", () => {
        component.signUpFormData = { ...validForm };

        expect(component.doSignUpFormValidation()).toBe(true);
    });

    it("should submit the form and show a success dialog", () => {
        component.signUpFormData = { ...validForm };

        component.onSignUpSubmit();

        expect(authService.signUpUser).toHaveBeenCalledWith(validForm);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ title: "Success", icon: "success" })
        );
    });

    it("should show an error dialog when signup fails", () => {
        authService.signUpUser.mockReturnValue(throwError(() => new Error("signup failed")));
        component.signUpFormData = { ...validForm };

        component.onSignUpSubmit();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Error in user creation" })
        );
    });

    it("should submit through the template", () => {
        component.signUpFormData = { ...validForm };
        fixture.detectChanges();

        fixture.nativeElement.querySelector("form").dispatchEvent(new Event("submit"));

        expect(authService.signUpUser).toHaveBeenCalled();
    });
});
