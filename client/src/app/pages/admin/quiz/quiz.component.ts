import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { QuizModel } from "@app/models/quiz";
import { CategoryService } from "@app/services/category.service";
import { QuizService } from "@app/services/quiz.service";
import Swal from "sweetalert2";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-quiz",
    templateUrl: "./quiz.component.html",
    styleUrls: ["./quiz.component.css"],
})
export class QuizComponent implements OnInit {
    quizzes: QuizModel[] | null = null;

    constructor(private quizService: QuizService, private categoryService: CategoryService) {}

    ngOnInit(): void {
        this.quizService.getAllQuiz().subscribe(
            (data: QuizModel[]) => {
                console.log("Success in loading quizzes: " + data);
                this.quizzes = data;
                this.quizzes.forEach((quiz) => console.log(quiz));
            },
            (error: any) => {
                console.log("Error Occured: " + error);
                Swal.fire({
                    icon: "error",
                    text: "Error in loading quizzes.",
                    timer: 2000,
                });
            }
        );
    }

    deleteQuiz(quizId: number | undefined): void {
        if (!quizId) return;
        Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                this.quizService.deleteQuizById(quizId).subscribe(
                    (data: boolean) => {
                        console.log("deleted: " + data);
                        Swal.fire({
                            icon: "success",
                            title: "Quiz Delete",
                            text: "Deletion successful.",
                        });
                        this.quizzes = this.quizzes?.filter((quiz) => quiz.quizId !== quizId)!;
                    },
                    (error: any) => {
                        console.log("error in deletion: " + error);
                        Swal.fire({
                            icon: "error",
                            title: "Quiz Delete",
                            text: "Some problem occured in deletion.",
                        });
                    }
                );
            }
        });
    }
}
