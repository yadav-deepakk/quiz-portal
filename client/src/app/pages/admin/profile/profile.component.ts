import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { UserDetail } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";
import Swal from "sweetalert2";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
    user: UserDetail | null = null;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        try {
            this.authService.getCurrentUser().subscribe(
                (data: UserDetail) => {
                    console.log(data);
                    this.user = data;
                },
                (error) => {
                    console.log(error);
                    Swal.fire({
                        icon: "error",
                        title: "unable to load profile data",
                        timer: 1500,
                    });
                }
            );
        } catch (error) {
            console.log(error);
            this.user = this.authService.getCurrentSavedUser();
        }
    }
}
