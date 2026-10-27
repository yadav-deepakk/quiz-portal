import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { UserWelcomeComponent } from "./user-welcome.component";
import { AuthService } from "@app/services/auth.service";
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
    authorities: [{ authority: "NORMAL" }],
};

describe("UserWelcomeComponent", () => {
    let component: UserWelcomeComponent;
    let fixture: ComponentFixture<UserWelcomeComponent>;
    let authService: { getCurrentSavedUser: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authService = { getCurrentSavedUser: vi.fn().mockReturnValue(user) };

        TestBed.configureTestingModule({
            imports: [UserWelcomeComponent],
            providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
        });
        fixture = TestBed.createComponent(UserWelcomeComponent);
        component = fixture.componentInstance;
    });

    it("should create and read the saved user", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(authService.getCurrentSavedUser).toHaveBeenCalled();
        expect(component.user).toEqual(user);
        expect(fixture.nativeElement.textContent).toContain("DEEPAK YADAV");
        expect(fixture.nativeElement.textContent).toContain("yadav_deepakk");
    });

    it("should render without a saved user", () => {
        authService.getCurrentSavedUser.mockReturnValue(null);

        fixture.detectChanges();

        expect(component.user).toBeNull();
        expect(fixture.nativeElement.textContent).toContain("Welcome");
    });
});
