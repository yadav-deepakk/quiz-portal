import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CategoryModel } from "@app/models/category";
import { CategoryService } from "@app/services/category.service";
import Swal from "sweetalert2";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-add-category",
    templateUrl: "./add-category.component.html",
    styleUrls: ["./add-category.component.css"],
})
export class AddCategoryComponent implements OnInit {
    categoryFormData: CategoryModel = {
        categoryTitle: "",
        categoryDescription: "",
    };

    constructor(private snack: MatSnackBar, private categService: CategoryService) {}

    ngOnInit(): void {}

    onAddCategoryFormSubmit(): void {
        let isValidForm: boolean = this.validateAddCategoryForm();
        if (!isValidForm) {
            console.log("form details invalid!!!");
            return;
        }

        this.categService.postCategory(this.categoryFormData).subscribe(
            (data: CategoryModel) => {
                console.log("data recieved: " + data);
                Swal.fire({
                    icon: "success",
                    title: "Category saved successfully.",
                });
                this.categoryFormData.categoryTitle = "";
                this.categoryFormData.categoryDescription = "";
            },
            (error: any) => {
                console.log("error occured: " + error);
                Swal.fire({
                    icon: "error",
                    titleText: "error in saving category.",
                });
            }
        );

        console.log("form submitted...");
    }
    validateAddCategoryForm(): boolean {
        if (this.categoryFormData.categoryTitle == null || this.categoryFormData.categoryTitle.trim() == "") {
            this.snack.open("Please enter a category title", "OK", { duration: 3000 });
            return false;
        }

        let titleLen: number = this.categoryFormData.categoryTitle.trim().length;
        if (titleLen < 1 && titleLen > 1000) {
            this.snack.open("category title can be 100 characters long.", "OK", {
                duration: 3000,
            });
            return false;
        }

        let descriptionLen: number = this.categoryFormData.categoryDescription?.trim().length ?? 0;
        if (descriptionLen < 1 && descriptionLen > 2500) {
            this.snack.open("category description can be 2500 character long!", "OK", { duration: 3000 });
            return false;
        }

        return true;
    }
}
