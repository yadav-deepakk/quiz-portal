import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { Subject, of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { UserHomeComponent } from "./user-home.component";
import { QuizService } from "@app/services/quiz.service";
import { QuizModel } from "@app/models/quiz";

const quizzes: QuizModel[] = [
    {
        quizId: 1,
        quizTitle: "Java Basics",
        isActiveQuiz: true,
        category: { categoryId: 1, categoryTitle: "Java" },
    },
    {
        quizId: 2,
        quizTitle: "Java Advanced",
        isActiveQuiz: false,
        category: { categoryId: 1, categoryTitle: "Java" },
    },
    {
        quizId: 3,
        quizTitle: "Spring Basics",
        isActiveQuiz: true,
        category: { categoryId: 2, categoryTitle: "Spring" },
    },
];

describe("UserHomeComponent", () => {
    let component: UserHomeComponent;
    let fixture: ComponentFixture<UserHomeComponent>;
    let quizService: { getAllQuiz: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        quizService = { getAllQuiz: vi.fn().mockReturnValue(of(quizzes)) };

        TestBed.configureTestingModule({
            imports: [UserHomeComponent],
            providers: [
                provideRouter([]),
                { provide: QuizService, useValue: quizService },
                { provide: ActivatedRoute, useValue: { params: of({ categoryId: 1 }) } },
            ],
        });
        fixture = TestBed.createComponent(UserHomeComponent);
        component = fixture.componentInstance;
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => vi.restoreAllMocks());

    it("should create, load quizzes and filter by the selected category", () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(quizService.getAllQuiz).toHaveBeenCalled();
        expect(component.allQuizzes).toEqual(quizzes);
        expect(component.quizzesToDisplay).toEqual([quizzes[0]]);
        expect(fixture.nativeElement.textContent).toContain("Java Basics");
    });

    it("should display all active quizzes when the category is zero", () => {
        component.allQuizzes = [...quizzes];
        component.categoryIdPathVar = 0;

        component.filterQuizzesBasedOnCategory();

        expect(component.quizzesToDisplay).toEqual([quizzes[0], quizzes[2]]);
    });

    it("should display all active quizzes when no category is selected", () => {
        component.allQuizzes = [...quizzes];
        component.categoryIdPathVar = undefined;

        component.filterQuizzesBasedOnCategory();

        expect(component.quizzesToDisplay).toEqual([quizzes[0], quizzes[2]]);
    });

    it("should show an error when quizzes cannot be loaded", () => {
        quizService.getAllQuiz.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", title: "Quiz Loading" }));
    });

    it("should refilter without reloading when the route changes after the first load", () => {
        const params = new Subject<{ categoryId: number }>();
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [UserHomeComponent],
            providers: [
                provideRouter([]),
                { provide: QuizService, useValue: quizService },
                { provide: ActivatedRoute, useValue: { params } },
            ],
        });
        fixture = TestBed.createComponent(UserHomeComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
        params.next({ categoryId: 1 });
        params.next({ categoryId: 2 });

        expect(quizService.getAllQuiz).toHaveBeenCalledTimes(1);
        expect(component.categoryIdPathVar).toBe(2);
        expect(component.quizzesToDisplay).toEqual([quizzes[2]]);
    });
});
