import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { UserDetail } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-user-welcome",
    templateUrl: "./user-welcome.component.html",
    styleUrls: ["./user-welcome.component.css"],
})
export class UserWelcomeComponent implements OnInit {
    user: UserDetail | null = null;
    constructor(private userSer: AuthService) {}
    ngOnInit(): void {
        this.user = this.userSer.getCurrentSavedUser();
    }
}
