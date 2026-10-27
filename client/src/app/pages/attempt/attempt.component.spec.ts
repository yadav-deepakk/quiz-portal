import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter, Router } from "@angular/router";
import { LocationStrategy } from "@angular/common";
import { of, throwError } from "rxjs";
import Swal from "sweetalert2";

import { AttemptComponent } from "./attempt.component";
import { QuestionService } from "@app/services/question.service";
import { QuizService } from "@app/services/quiz.service";
import { QuestionModel } from "@app/models/question";
import { QuizResultModel } from "@app/models/quizResult";

const questions: QuestionModel[] = [
    {
        questionId: 1,
        questionContent: "What is 2 + 2?",
        option1: "2",
        option2: "3",
        option3: "4",
        option4: "5",
        answer: "4",
        quiz: { quizId: 9, quizTitle: "Java Basics", quizMaxMarks: 10, category: { categoryId: 1 } },
    },
    {
        questionId: 2,
        questionContent: "What is 3 + 3?",
        option1: "5",
        option2: "6",
        option3: "7",
        option4: "8",
        answer: "6",
        quiz: { quizId: 9, quizTitle: "Java Basics", quizMaxMarks: 10, category: { categoryId: 1 } },
    },
];

describe("AttemptComponent", () => {
    let component: AttemptComponent;
    let fixture: ComponentFixture<AttemptComponent>;
    let router: Router;
    let locationStrategy: LocationStrategy;
    let questionService: { getQuestionOfQuizForTest: ReturnType<typeof vi.fn> };
    let quizService: { evaluateQuizResult: ReturnType<typeof vi.fn> };

    const result: QuizResultModel = { totalQuestionCount: 2, attemptedQuestionCount: 1, correctAnswerCount: 1, score: 50 };

    beforeEach(() => {
        vi.useFakeTimers();
        questionService = { getQuestionOfQuizForTest: vi.fn().mockReturnValue(of(questions)) };
        quizService = { evaluateQuizResult: vi.fn().mockReturnValue(of(result)) };

        TestBed.configureTestingModule({
            imports: [AttemptComponent],
            providers: [
                provideRouter([]),
                { provide: QuestionService, useValue: questionService },
                { provide: QuizService, useValue: quizService },
                { provide: ActivatedRoute, useValue: { snapshot: { params: { quizId: 9 } } } },
            ],
        });
        fixture = TestBed.createComponent(AttemptComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        locationStrategy = TestBed.inject(LocationStrategy);
        vi.spyOn(router, "navigate").mockResolvedValue(true);
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: true, isDenied: false, isDismissed: false } as any);
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should load questions and initialise the quiz", () => {
        const preventSpy = vi.spyOn(component, "preventBackButton");
        const timerSpy = vi.spyOn(component, "startTimer");

        fixture.detectChanges();

        expect(questionService.getQuestionOfQuizForTest).toHaveBeenCalledWith(9);
        expect(component.allQuizQuestions).toEqual(questions);
        expect(component.quizTitle).toBe("Java Basics");
        expect(component.quizMaxMarks).toBe(10);
        expect(component.totalRemainingTime).toBe(questions.length * 2 * 60);
        expect(preventSpy).toHaveBeenCalled();
        expect(timerSpy).toHaveBeenCalled();
    });

    it("should default the maximum marks when quiz details are missing", () => {
        questionService.getQuestionOfQuizForTest.mockReturnValue(
            of([{ questionId: 1, questionContent: "Q", answer: "a" }])
        );
        vi.spyOn(component, "preventBackButton").mockImplementation(() => {});
        vi.spyOn(component, "startTimer").mockImplementation(() => {});

        fixture.detectChanges();

        expect(component.quizMaxMarks).toBe(1);
        expect(component.quizTitle).toBeUndefined();
    });

    it("should warn and leave when no questions are available", () => {
        questionService.getQuestionOfQuizForTest.mockReturnValue(of([]));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "warning", title: "Unable to start Quiz!" })
        );
        expect(router.navigate).toHaveBeenCalledWith(["/user/"]);
        expect(component.allQuizQuestions).toBeNull();
    });

    it("should show an error when questions cannot be loaded", () => {
        questionService.getQuestionOfQuizForTest.mockReturnValue(throwError(() => new Error("load failed")));

        fixture.detectChanges();

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", title: "Questions Fetch" }));
    });

    it("should prevent the context menu", () => {
        const event = new Event("contextmenu");
        const spy = vi.spyOn(event, "preventDefault");

        component.onRightClick(event);

        expect(spy).toHaveBeenCalled();
    });

    it("should prevent unloading the page", () => {
        const event = new Event("beforeunload");
        const spy = vi.spyOn(event, "preventDefault");

        component.unloadHandler(event);

        expect(spy).toHaveBeenCalled();
    });

    it("should push history state when preventing the back button", () => {
        const pushSpy = vi.spyOn(history, "pushState").mockImplementation(() => {});
        const popSpy = vi.spyOn(locationStrategy, "onPopState").mockImplementation((callback) => {
            callback({} as any);
        });

        component.preventBackButton();

        expect(popSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalledTimes(2);
    });

    it("should submit the quiz after confirmation without a deny option at the start", async () => {
        const evaluateSpy = vi.spyOn(component, "evaluateQuizResultAtBackEnd").mockImplementation(() => {});
        component.mm = 0;
        component.ss = 0;

        component.submitQuiz();
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ showDenyButton: false }));
        expect(evaluateSpy).toHaveBeenCalledWith(false);
    });

    it("should offer the deny option when time remains", async () => {
        vi.spyOn(component, "evaluateQuizResultAtBackEnd").mockImplementation(() => {});
        component.mm = 2;
        component.ss = 30;

        component.submitQuiz();
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ showDenyButton: true }));
    });

    it("should not evaluate when quiz submission is dismissed", async () => {
        vi.spyOn(Swal, "fire").mockResolvedValue({ isConfirmed: false, isDenied: true, isDismissed: false } as any);
        const evaluateSpy = vi.spyOn(component, "evaluateQuizResultAtBackEnd").mockImplementation(() => {});

        component.submitQuiz();
        await Promise.resolve();

        expect(evaluateSpy).not.toHaveBeenCalled();
    });

    it("should evaluate the quiz in the backend and show the result", () => {
        component.allQuizQuestions = questions;

        component.evaluateQuizResultAtBackEnd(false);

        expect(quizService.evaluateQuizResult).toHaveBeenCalledWith(questions);
        expect(component.quizResult).toEqual(result);
        expect(component.isQuizSubmitted).toBe(true);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "success", title: "Quiz Submitted!" })
        );
    });

    it("should show a warning when time has run out", () => {
        component.allQuizQuestions = questions;

        component.evaluateQuizResultAtBackEnd(true);

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", text: "Times Up!" }));
    });

    it("should navigate to the dashboard when backend evaluation fails", async () => {
        quizService.evaluateQuizResult.mockReturnValue(throwError(() => new Error("evaluation failed")));
        component.allQuizQuestions = questions;

        component.evaluateQuizResultAtBackEnd(false);
        await Promise.resolve();
        await Promise.resolve();

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: "error", title: "Quiz Evaluation!" })
        );
        expect(router.navigate).toHaveBeenCalledWith(["/user"]);
    });

    it("should evaluate the quiz locally and calculate the score", () => {
        const clearSpy = vi.spyOn(window, "clearInterval");
        component.allQuizQuestions = [{ ...questions[0], givenAnswer: "4" }, { ...questions[1] }];

        component.evaluateQuizResult(false);

        expect(component.isQuizSubmitted).toBe(true);
        expect(component.attempted).toBe(1);
        expect(component.quizScore).toBe(50);
        expect(clearSpy).toHaveBeenCalled();
    });

    it("should count wrong answers as attempted but not correct", () => {
        component.allQuizQuestions = [{ ...questions[0], givenAnswer: "2" }];

        component.evaluateQuizResult(false);

        expect(component.attempted).toBe(1);
        expect(component.quizScore).toBe(0);
    });

    it("should count down the timer and submit when time runs out", () => {
        const evaluateSpy = vi.spyOn(component, "evaluateQuizResultAtBackEnd").mockImplementation(() => {});
        component.totalRemainingTime = 1;

        component.startTimer();
        vi.advanceTimersByTime(1000);

        expect(component.totalRemainingTime).toBe(0);
        expect(component.mm).toBe(0);
        expect(component.ss).toBe(0);
        expect(evaluateSpy).toHaveBeenCalledWith(false);
    });

    it("should update the remaining minutes and seconds while time remains", () => {
        component.totalRemainingTime = 125;

        component.startTimer();
        vi.advanceTimersByTime(1000);

        expect(component.totalRemainingTime).toBe(124);
        expect(component.mm).toBe(2);
        expect(component.ss).toBe(4);
    });
});
