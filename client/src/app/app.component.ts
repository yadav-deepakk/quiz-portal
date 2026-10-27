import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxUiLoaderModule, SPINNER } from "ngx-ui-loader";

import { NavbarComponent } from "./components/navbar/navbar.component";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterModule, NgxUiLoaderModule, NavbarComponent],
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    spinnerTypeSquareJellyBox = SPINNER.squareJellyBox;
}
