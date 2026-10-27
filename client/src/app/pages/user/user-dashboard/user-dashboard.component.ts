import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

import { UserSidebarComponent } from "../user-sidebar/user-sidebar.component";

@Component({
    selector: "app-user-dashboard",
    standalone: true,
    imports: [RouterModule, UserSidebarComponent],
    templateUrl: "./user-dashboard.component.html",
    styleUrls: ["./user-dashboard.component.css"],
})
export class UserDashboardComponent {}
