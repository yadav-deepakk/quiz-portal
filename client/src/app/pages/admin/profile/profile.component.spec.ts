import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { ProfileComponent } from "./profile.component";
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
    authorities: [{ authority: "ADMIN" }],
};

describe("ProfileComponent", () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let authService: {
        getCurrentUser: ReturnType<typeof vi.fn>;
        getCurrentSavedUser: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        authService = {
            getCurrentUser: vi.fn().mockReturnValue(of(user)),
            getCurrentSavedUser: vi.fn().mockReturnValue(user),
        };

        TestBed.configureTestingModule({
            imports: [ProfileComponent],
            providers: [{ provide: AuthService, useValue: authService }],
        });
        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create and load the profile", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(authService.getCurrentUser).toHaveBeenCalled();
        expect(component.user).toEqual(user);
        expect(fixture.nativeElement.textContent).toContain("DEEPAK YADAV");
        expect(fixture.nativeElement.textContent).toContain("yadav_deepakk");
    });

    it("should show an error when the profile cannot be loaded", () => {
        authService.getCurrentUser.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "unable to load profile data" })
        );
        expect(component.user).toBeNull();
    });

    it("should fall back to the saved user when loading throws", () => {
        authService.getCurrentUser.mockImplementation(() => {
            throw new Error("sync failure");
        });

        fixture.detectChanges();

        expect(authService.getCurrentSavedUser).toHaveBeenCalled();
        expect(component.user).toEqual(user);
    });
});
