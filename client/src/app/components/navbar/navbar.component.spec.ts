import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { Subject } from "rxjs";

import { NavbarComponent } from "./navbar.component";
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

describe("NavbarComponent", () => {
    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;
    let router: Router;
    let authService: {
        isUserLoggedIn: ReturnType<typeof vi.fn>;
        getCurrentSavedUser: ReturnType<typeof vi.fn>;
        checkUserHasRole: ReturnType<typeof vi.fn>;
        logoutUser: ReturnType<typeof vi.fn>;
        loginStatusSubject: Subject<boolean>;
    };

    beforeEach(() => {
        authService = {
            isUserLoggedIn: vi.fn().mockReturnValue(false),
            getCurrentSavedUser: vi.fn().mockReturnValue(null),
            checkUserHasRole: vi.fn().mockReturnValue(false),
            logoutUser: vi.fn(),
            loginStatusSubject: new Subject<boolean>(),
        };

        TestBed.configureTestingModule({
            imports: [NavbarComponent],
            providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
        });
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create and render the logged out navigation", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.loggedIn).toBe(false);
        const anchors = fixture.nativeElement.querySelectorAll("a") as NodeListOf<HTMLAnchorElement>;
        const links = Array.from(anchors).map((link) => link.textContent?.trim());
        expect(links).toContain("Register");
        expect(links).toContain("Login");
    });

    it("should show the username and dashboard menu when logged in", () => {
        authService.isUserLoggedIn.mockReturnValue(true);
        authService.getCurrentSavedUser.mockReturnValue(user);

        fixture.detectChanges();

        expect(component.loggedIn).toBe(true);
        expect(component.user).toEqual(user);
        expect(fixture.nativeElement.textContent).toContain("yadav_deepakk");
    });

    it("should react to login status changes", () => {
        fixture.detectChanges();
        expect(component.loggedIn).toBe(false);

        authService.isUserLoggedIn.mockReturnValue(true);
        authService.getCurrentSavedUser.mockReturnValue(user);
        authService.loginStatusSubject.next(true);

        expect(component.loggedIn).toBe(true);
        expect(component.user).toEqual(user);
    });

    it("should navigate admins to the admin dashboard", () => {
        component.loggedIn = true;
        authService.checkUserHasRole.mockImplementation((role: string) => role === UserRolesEnum.ADMIN);

        component.navigateToDashBoard();

        expect(router.navigate).toHaveBeenCalledWith([AvailableRoutes.AdminDashboard]);
    });

    it("should navigate normal users to the user dashboard", () => {
        component.loggedIn = true;
        authService.checkUserHasRole.mockReturnValue(false);

        component.navigateToDashBoard();

        expect(router.navigate).toHaveBeenCalledWith([AvailableRoutes.UserDashboard]);
    });

    it("should navigate to login when the user is logged out", () => {
        component.loggedIn = false;

        component.navigateToDashBoard();

        expect(router.navigate).toHaveBeenCalledWith([AvailableRoutes.Login]);
    });

    it("should log the user out and notify subscribers", () => {
        const statusSpy = vi.fn();
        authService.loginStatusSubject.subscribe(statusSpy);

        component.logoutUser();

        expect(authService.logoutUser).toHaveBeenCalled();
        expect(statusSpy).toHaveBeenCalledWith(false);
    });
});
