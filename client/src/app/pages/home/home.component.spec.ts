import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { HomeComponent } from "./home.component";

describe("HomeComponent", () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HomeComponent],
            providers: [provideRouter([])],
        });
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should render the default username", () => {
        expect(component.username).toBe("User");
        expect(fixture.nativeElement.textContent).toContain("Welcome to the Home Page User");
    });
});
