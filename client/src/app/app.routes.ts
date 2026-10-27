import { Routes } from "@angular/router";

import { AvailableRoutes } from "./app.enum";
import { adminUserGuard, normalUserGuard, nonLoggedInUserGuard } from "./services/user.guard.guard";

import { HomeComponent } from "./pages/home/home.component";
import { SignupComponent } from "./pages/signup/signup.component";
import { LoginComponent } from "./pages/login/login.component";

import { AdminDashboardComponent } from "./pages/admin/admin-dashboard/admin-dashboard.component";
import { WelcomeComponent } from "./pages/admin/welcome/welcome.component";
import { ProfileComponent } from "./pages/admin/profile/profile.component";
import { ViewCategoriesComponent } from "./pages/admin/view-categories/view-categories.component";
import { AddCategoryComponent } from "./pages/admin/add-category/add-category.component";
import { QuizComponent } from "./pages/admin/quiz/quiz.component";
import { AddQuizComponent } from "./pages/admin/add-quiz/add-quiz.component";
import { UpdateQuizComponent } from "./pages/admin/update-quiz/update-quiz.component";
import { UpdateCategoryComponent } from "./pages/admin/update-category/update-category.component";
import { QuizQuestionsComponent } from "./pages/admin/quiz-questions/quiz-questions.component";
import { EditQuestionsComponent } from "./pages/admin/edit-questions/edit-questions.component";
import { AddQuestionsComponent } from "./pages/admin/add-questions/add-questions.component";

import { UserDashboardComponent } from "./pages/user/user-dashboard/user-dashboard.component";
import { UserHomeComponent } from "./pages/user/user-home/user-home.component";
import { UserWelcomeComponent } from "./pages/user/user-welcome/user-welcome.component";
import { InstructionsComponent } from "./pages/user/instructions/instructions.component";
import { AttemptComponent } from "./pages/attempt/attempt.component";

export const routes: Routes = [
    {
        path: AvailableRoutes.Root,
        pathMatch: "full",
        component: HomeComponent,
    },
    {
        path: AvailableRoutes.Home,
        pathMatch: "full",
        component: HomeComponent,
    },
    {
        path: AvailableRoutes.AdminDashboard,
        component: AdminDashboardComponent,
        canActivate: [adminUserGuard],
        children: [
            { path: "", component: WelcomeComponent },
            { path: "profile", component: ProfileComponent },
            { path: "category", component: ViewCategoriesComponent },
            { path: "add-category", component: AddCategoryComponent },
            { path: "category/:categoryId", component: UpdateCategoryComponent },
            { path: "quiz", component: QuizComponent },
            { path: "add-quiz", component: AddQuizComponent },
            { path: "quiz/:quizId", component: UpdateQuizComponent },
            { path: "questions/quiz/:quizId/:quizTitle", component: QuizQuestionsComponent },
            { path: "add-question/quiz/:quizId/:quizTitle", component: AddQuestionsComponent },
            { path: "update-question/quiz/:quizId/:quizTitle/:questionId", component: EditQuestionsComponent },
        ],
    },
    {
        path: AvailableRoutes.UserDashboard,
        component: UserDashboardComponent,
        canActivate: [normalUserGuard],
        children: [
            { path: "", component: UserWelcomeComponent },
            { path: "quizzes/:categoryId", component: UserHomeComponent },
            { path: "quiz/instruction/:quizId", component: InstructionsComponent },
        ],
    },
    {
        path: AvailableRoutes.Signup,
        pathMatch: "full",
        component: SignupComponent,
        canActivate: [nonLoggedInUserGuard],
    },
    {
        path: AvailableRoutes.Login,
        pathMatch: "full",
        component: LoginComponent,
        canActivate: [nonLoggedInUserGuard],
    },
    {
        path: `${AvailableRoutes.StartQuiz}/:quizId`,
        pathMatch: "full",
        component: AttemptComponent,
        canActivate: [normalUserGuard],
    },
    {
        path: "**",
        redirectTo: AvailableRoutes.Root,
    },
];
