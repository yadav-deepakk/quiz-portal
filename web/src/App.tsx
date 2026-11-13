import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "./components/AdminLayout";
import { Layout } from "./components/Layout";
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";
import { UserLayout } from "./components/UserLayout";
import { AttemptQuiz } from "./pages/AttemptQuiz";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Signup } from "./pages/Signup";
import { AdminWelcome } from "./pages/admin/AdminWelcome";
import { Categories } from "./pages/admin/Categories";
import { CategoryForm } from "./pages/admin/CategoryForm";
import { Profile } from "./pages/admin/Profile";
import { QuestionForm } from "./pages/admin/QuestionForm";
import { QuizForm } from "./pages/admin/QuizForm";
import { QuizQuestions } from "./pages/admin/QuizQuestions";
import { Quizzes } from "./pages/admin/Quizzes";
import { Instructions } from "./pages/user/Instructions";
import { QuizList } from "./pages/user/QuizList";
import { UserWelcome } from "./pages/user/UserWelcome";

export function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="home" element={<Navigate to="/" replace />} />

                <Route
                    path="login"
                    element={
                        <PublicOnlyRoute>
                            <Login />
                        </PublicOnlyRoute>
                    }
                />
                <Route
                    path="signup"
                    element={
                        <PublicOnlyRoute>
                            <Signup />
                        </PublicOnlyRoute>
                    }
                />

                <Route element={<ProtectedRoute role="ADMIN" />}>
                    <Route path="admin" element={<AdminLayout />}>
                        <Route index element={<AdminWelcome />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="category" element={<Categories />} />
                        <Route path="add-category" element={<CategoryForm />} />
                        <Route path="category/:categoryId" element={<CategoryForm />} />
                        <Route path="quiz" element={<Quizzes />} />
                        <Route path="add-quiz" element={<QuizForm />} />
                        <Route path="quiz/:quizId" element={<QuizForm />} />
                        <Route path="questions/quiz/:quizId/:quizTitle" element={<QuizQuestions />} />
                        <Route path="add-question/quiz/:quizId/:quizTitle" element={<QuestionForm />} />
                        <Route
                            path="update-question/quiz/:quizId/:quizTitle/:questionId"
                            element={<QuestionForm />}
                        />
                    </Route>
                </Route>

                <Route element={<ProtectedRoute role="NORMAL" />}>
                    <Route path="user" element={<UserLayout />}>
                        <Route index element={<UserWelcome />} />
                        <Route path="quizzes/:categoryId" element={<QuizList />} />
                        <Route path="quiz/instruction/:quizId" element={<Instructions />} />
                    </Route>
                    <Route path="start/:quizId" element={<AttemptQuiz />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
