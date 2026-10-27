import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter, Router } from "@angular/router";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { InstructionsComponent } from "./instructions.component";
import { QuizService } from "@app/services/quiz.service";
import { QuizModel } from "@app/models/quiz";

describe("InstructionsComponent", () => {
    let component: InstructionsComponent;
    let fixture: ComponentFixture<InstructionsComponent>;
    let router: Router;
    let quizService: { getQuizById: ReturnType<typeof vi.fn> };

    const quiz: QuizModel = {
        quizId: 5,
        quizTitle: "Java Basics",
        quizDescription: "Basic Java",
        questionCount: 3,
        quizMaxMarks: 15,
        isActiveQuiz: true,
        category: { categoryId: 1, categoryTitle: "Java" },
    };

    beforeEach(() => {
        quizService = { getQuizById: vi.fn().mockReturnValue(of(quiz)) };

        TestBed.configureTestingModule({
            imports: [InstructionsComponent],
            providers: [
                provideRouter([]),
                { provide: QuizService, useValue: quizService },
                { provide: ActivatedRoute, useValue: { snapshot: { params: { quizId: 5 } } } },
            ],
        });
        fixture = TestBed.createComponent(InstructionsComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create, read the quiz id and load the quiz", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(component.quizIdPathVar).toBe(5);
        expect(quizService.getQuizById).toHaveBeenCalledWith(5);
        expect(component.quiz).toEqual(quiz);
        expect(fixture.nativeElement.textContent).toContain("Java Basics");
    });

    it("should show an error when the quiz cannot be loaded", () => {
        quizService.getQuizById.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Quiz Fetch" })
        );
    });

    it("should start the quiz after confirmation", async () => {
        fixture.detectChanges();

        component.startQuiz();
        await Promise.resolve();
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "warning", title: "Start Quiz Java Basics" })
        );
        expect(router.navigate).toHaveBeenCalledWith(["/start/5"]);
    });

    it("should not start the quiz when the confirmation is dismissed", async () => {
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: false, isDenied: true, isDismissed: false } as any);
        fixture.detectChanges();

        component.startQuiz();
        await Promise.resolve();

        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("should start through the template button", () => {
        fixture.detectChanges();
        const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
        const spy = vi.spyOn(component, "startQuiz");

        button.click();

        expect(spy).toHaveBeenCalled();
    });
});
