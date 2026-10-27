import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component } from "@angular/core";
import { AvailableRoutes } from "@app/app.enum";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent {
    appRoutes = AvailableRoutes;
}
