import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { CategoryModel } from "@app/models/category";
import { CategoryService } from "@app/services/category.service";
import Swal from "sweetalert2";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-user-sidebar",
    templateUrl: "./user-sidebar.component.html",
    styleUrls: ["./user-sidebar.component.css"],
})
export class UserSidebarComponent implements OnInit {
    categories: CategoryModel[] | null = null;
    constructor(private categoryService: CategoryService) {}
    ngOnInit(): void {
        this.categoryService.getCategories().subscribe(
            (data: CategoryModel[]) => {
                console.log(data);
                this.categories = data;
            },
            (error: any) => {
                console.log("error: " + error);
                Swal.fire({
                    icon: "error",
                    title: "Categories Retreival",
                    text: "Error in loading categories from server!",
                });
            }
        );
    }
}
