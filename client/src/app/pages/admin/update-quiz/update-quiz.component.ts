import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { CategoryModel } from "@app/models/category";
import { QuizModel } from "@app/models/quiz";
import { CategoryService } from "@app/services/category.service";
import { QuizService } from "@app/services/quiz.service";
import Swal from "sweetalert2";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-update-quiz",
    templateUrl: "./update-quiz.component.html",
    styleUrls: ["./update-quiz.component.css"],
})
export class UpdateQuizComponent implements OnInit {
    quizId: number | undefined = undefined;
    allCategories: CategoryModel[] | undefined = undefined;
    category: CategoryModel = {
        categoryId: undefined,
    };
    quiz: QuizModel = {
        category: this.category,
    };

    constructor(
        private quizService: QuizService,
        private categoryService: CategoryService,
        private snack: MatSnackBar,
        private activedRoute: ActivatedRoute,
        private router: Router
    ) {}
    ngOnInit(): void {
        this.quizId = this.activedRoute.snapshot.params["quizId"];
        // alert("update quiz id: " + this.quizId);

        this.quiz.quizId = this.quizId;
        if (this.quizId) {
            this.quizService.getQuizById(this.quizId).subscribe(
                (data: QuizModel) => {
                    console.log(data + " need to be edited!");
                    this.quiz = data;
                },
                (error: any) => {
                    console.log("error in obtaining data of quiz to be updated!" + error);
                    Swal.fire({
                        icon: "error",
                        text: "Error in obtaining data of quiz to be updated",
                    });
                }
            );
        }

        this.categoryService.getCategories().subscribe(
            (data: CategoryModel[]) => {
                console.log("Categories data: " + data);
                this.allCategories = data;
            },
            (error: any) => {
                console.log("Error occured in fetching the category detalis" + error);
                Swal.fire({
                    icon: "error",
                    title: "Categories Fetch",
                    text: "Error in fetching all categies.",
                });
            }
        );
    }

    onUpdateFormSubmit(): void {
        // 1. validate
        let validateForm: boolean = this.validateUpdateQuizForm();
        if (!validateForm) {
            console.log("Invalid form data!");
            return;
        }

        // 2. update api call
        this.quizService.updateQuiz(this.quiz).subscribe(
            (data: QuizModel) => {
                console.log("updated cateogory data: " + data);
                if (data.quizId) {
                    Swal.fire({
                        icon: "success",
                        title: "Quiz Update",
                        text: "Update Successful.",
                    }).then((res) => {
                        // 3. redirect to all quizzes page.
                        if (res.isConfirmed) this.router.navigate(["/admin/quiz"]);
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Update Quiz",
                        text: "Error Occured in upadating Quiz",
                    });
                }
            },
            (error: any) => {
                console.log("Error encountered: " + error);
                Swal.fire({
                    icon: "error",
                    title: "Update Quiz",
                    text: "Error Occured in upadating Quiz",
                });
            }
        );
    }

    validateUpdateQuizForm(): boolean {
        let titleLen: number = this.quiz.quizTitle ? this.quiz.quizTitle?.trim().length : 0;
        if (titleLen > 1000 && titleLen < 1) {
            this.snack.open("Title length should be between 1 and 1000 character", "OK", { duration: 2500 });
            return false;
        }
        // descrption
        let descLen: number = this.quiz.quizDescription ? this.quiz.quizDescription?.trim().length : 0;
        if (descLen > 3000 && descLen < 1) {
            this.snack.open("Description must be less than 3000 characters", "OK", { duration: 2500 });
            return false;
        }

        // questioncount
        // marks

        // category
        if (!this.quiz.category.categoryId) {
            this.snack.open("Category must not be null.", "OK", { duration: 2500 });
            return false;
        }

        return true;
    }
}
