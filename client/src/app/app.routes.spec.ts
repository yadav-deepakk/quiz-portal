import { routes } from "./app.routes";
import { AvailableRoutes } from "./app.enum";
import { adminUserGuard, nonLoggedInUserGuard, normalUserGuard } from "./services/user.guard.guard";

describe("app routes", () => {
    it("should expose a root and a home route", () => {
        const root = routes.find((route) => route.path === AvailableRoutes.Root);
        const home = routes.find((route) => route.path === AvailableRoutes.Home);

        expect(root?.pathMatch).toBe("full");
        expect(home?.pathMatch).toBe("full");
    });

    it("should guard the admin dashboard and define its children", () => {
        const admin = routes.find((route) => route.path === AvailableRoutes.AdminDashboard);

        expect(admin?.canActivate).toEqual([adminUserGuard]);
        expect(admin?.children?.map((child) => child.path)).toEqual([
            "",
            "profile",
            "category",
            "add-category",
            "category/:categoryId",
            "quiz",
            "add-quiz",
            "quiz/:quizId",
            "questions/quiz/:quizId/:quizTitle",
            "add-question/quiz/:quizId/:quizTitle",
            "update-question/quiz/:quizId/:quizTitle/:questionId",
        ]);
    });

    it("should guard the user dashboard and define its children", () => {
        const user = routes.find((route) => route.path === AvailableRoutes.UserDashboard);

        expect(user?.canActivate).toEqual([normalUserGuard]);
        expect(user?.children?.map((child) => child.path)).toEqual([
            "",
            "quizzes/:categoryId",
            "quiz/instruction/:quizId",
        ]);
    });

    it("should guard the login and signup routes", () => {
        const login = routes.find((route) => route.path === AvailableRoutes.Login);
        const signup = routes.find((route) => route.path === AvailableRoutes.Signup);

        expect(login?.canActivate).toEqual([nonLoggedInUserGuard]);
        expect(signup?.canActivate).toEqual([nonLoggedInUserGuard]);
    });

    it("should configure the quiz attempt route and the wildcard fallback", () => {
        const start = routes.find((route) => route.path === `${AvailableRoutes.StartQuiz}/:quizId`);
        const wildcard = routes.find((route) => route.path === "**");

        expect(start?.canActivate).toEqual([normalUserGuard]);
        expect(wildcard?.redirectTo).toBe(AvailableRoutes.Root);
    });
});
