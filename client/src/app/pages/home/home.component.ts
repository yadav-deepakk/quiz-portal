import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component } from "@angular/core";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"],
})
export class HomeComponent {
    username: string = "User";
}
