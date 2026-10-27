import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { CategoryModel } from "@app/models/category";
import { QuizModel } from "@app/models/quiz";
import { CategoryService } from "@app/services/category.service";
import { QuizService } from "@app/services/quiz.service";
import Swal from "sweetalert2";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-add-quiz",
    templateUrl: "./add-quiz.component.html",
    styleUrls: ["./add-quiz.component.css"],
})
export class AddQuizComponent implements OnInit {
    category: CategoryModel = {
        categoryId: undefined,
    };

    categories: CategoryModel[] | null = null;

    quizFormData: QuizModel = {
        quizId: undefined,
        quizTitle: "",
        quizDescription: "",
        questionCount: undefined,
        quizMaxMarks: undefined,
        isActiveQuiz: false,
        category: this.category,
    };

    constructor(
        private quizService: QuizService,
        private categoryService: CategoryService,
        private snack: MatSnackBar,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.categoryService.getCategories().subscribe(
            (data: CategoryModel[]) => {
                console.log("Success, categories received : " + data);
                this.categories = data;
            },
            (error: any) => {
                console.log("error in recieving categories." + error);
                Swal.fire({
                    icon: "error",
                    text: "Error in recieving categories.",
                    timer: 2000,
                });
            }
        );
    }

    onAddQuizFormSubmit(): void {
        console.log("submission button clicked!");
        let isValidForm = this.validateForm();
        if (!isValidForm) {
            console.log("Form invalid!");
            return;
        }

        this.quizService.postQuiz(this.quizFormData).subscribe(
            (data) => {
                console.log("success" + data);
                Swal.fire({ icon: "success", text: "Quiz Saved", timer: 2500 });

                this.router.navigate(["/admin/quiz"]);
            },
            (error: any) => {
                console.log(error);
                Swal.fire({ icon: "error", text: "Error in saving Quiz.", timer: 2000 });
            }
        );
    }

    validateForm(): boolean {
        // title
        let titleLen: number = this.quizFormData.quizTitle ? this.quizFormData.quizTitle?.trim().length : 0;
        if (titleLen > 1000 && titleLen < 1) {
            this.snack.open("Title length should be between 1 and 1000 character", "OK", { duration: 2500 });
            return false;
        }
        // descrption
        let descLen: number = this.quizFormData.quizDescription ? this.quizFormData.quizDescription?.trim().length : 0;
        if (descLen > 3000 && descLen < 1) {
            this.snack.open("Description must be less than 3000 characters", "OK", { duration: 2500 });
            return false;
        }

        // questioncount
        // marks

        // category
        if (!this.quizFormData.category.categoryId) {
            this.snack.open("Category must not be null.", "OK", { duration: 2500 });
            return false;
        }

        return true;
    }
}
