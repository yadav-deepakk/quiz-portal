import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

import { AuthService } from "./auth.service";
import { UserDetail } from "../models/user";

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

describe("AuthService", () => {
    let service: AuthService;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(AuthService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
        localStorage.clear();
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should fetch the current user", () => {
        let received: UserDetail | undefined;
        service.getCurrentUser().subscribe((data) => (received = data));

        const req = httpTesting.expectOne("http://localhost:8080/user/current-user");
        expect(req.request.method).toBe("GET");
        req.flush(user);

        expect(received).toEqual(user);
    });

    it("should sign up a user", () => {
        const request = {
            firstName: "Deepak",
            lastName: "Yadav",
            email: "deepak@example.com",
            phone: "9999999999",
            username: "yadav_deepakk",
            password: "Password1!",
        };

        service.signUpUser(request).subscribe();

        const req = httpTesting.expectOne("http://localhost:8080/api/auth/signup");
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush({ username: request.username, jwt: "token" });
    });

    it("should log in a user", () => {
        const request = { username: "yadav_deepakk", password: "Password1!" };

        service.logInUser(request).subscribe();

        const req = httpTesting.expectOne("http://localhost:8080/api/auth/login");
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush({ username: request.username, jwt: "token" });
    });

    it("should report login status based on the stored jwt", () => {
        expect(service.isUserLoggedIn()).toBe(false);
        localStorage.setItem("access_token", "abc");
        expect(service.isUserLoggedIn()).toBe(true);
    });

    it("should save and read the jwt", () => {
        expect(service.saveJwt("my-token")).toBe(true);
        expect(localStorage.getItem("access_token")).toBe("my-token");
        expect(service.getSavedJwt()).toBe("my-token");
    });

    it("should save and read the user details", () => {
        expect(service.saveUser(user)).toBe(true);
        expect(JSON.parse(localStorage.getItem("user_detail")!)).toEqual(user);
        expect(service.getCurrentSavedUser()).toEqual(user);
    });

    it("should log out when a saved user cannot be found", () => {
        const logoutSpy = vi.spyOn(service, "logoutUser");

        expect(service.getCurrentSavedUser()).toBeNull();
        expect(logoutSpy).toHaveBeenCalled();
    });

    it("should return the saved user authorities", () => {
        expect(service.getUserAuthorities()).toBeNull();

        service.saveUser(user);
        expect(service.getUserAuthorities()).toEqual(user.authorities);
    });

    it("should check roles of the logged in user", () => {
        expect(service.checkUserHasRole("ADMIN")).toBe(false);

        service.saveUser(user);
        expect(service.checkUserHasRole("ADMIN")).toBe(true);
        expect(service.checkUserHasRole("NORMAL")).toBe(false);
    });

    it("should clear the stored credentials on logout", () => {
        service.saveJwt("token");
        service.saveUser(user);

        service.logoutUser();

        expect(localStorage.getItem("access_token")).toBeNull();
        expect(localStorage.getItem("user_detail")).toBeNull();
    });
});
