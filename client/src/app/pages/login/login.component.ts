import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { JwtResponse } from "@app/models/jwt-response";
import { LogInRequest } from "@app/models/login-req";
import { AvailableRoutes, UserRolesEnum } from "@app/app.enum";
import { UserDetail } from "@app/models/user";
import { AuthService } from "@app/services/auth.service";
import Swal from "sweetalert2";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
    appRoutes = AvailableRoutes;
    public hidePassword: boolean = true;
    public loginFormData: LogInRequest = {
        username: "",
        password: "",
    };

    constructor(private snackBar: MatSnackBar, private authService: AuthService, private router: Router) {}

    ngOnInit(): void {}

    onLoginFormSubmit(): void {
        // validate form...
        let isLoginFormValid: boolean = true; // this.validateLoginForm();
        if (!isLoginFormValid) return;

        // submit form...
        console.log("login form submitted...");
        console.log(this.loginFormData);

        this.authService.logInUser(this.loginFormData).subscribe(
            (userToken: JwtResponse) => {
                console.log(userToken);
                // this.snackBar.open("User logged in successfully.", "OK", { duration: 2000 });
                Swal.fire({
                    title: "Success",
                    text: "User logged in successfully.",
                    icon: "success",
                });

                this.authService.saveJwt(userToken.jwt.valueOf());

                // request for current user details from server
                this.authService.getCurrentUser().subscribe(
                    (user: UserDetail) => {
                        console.log("user:" + user);
                        if (user) this.authService.saveUser(user);
                        // if ADMIN user:redirect to admin dashboard or redirect to user dashboard
                        if (this.authService.checkUserHasRole(UserRolesEnum.ADMIN.toString())) {
                            this.authService.loginStatusSubject.next(true);
                            this.router.navigate([AvailableRoutes.AdminDashboard]);
                        }
                        if (this.authService.checkUserHasRole(UserRolesEnum.NORMAL.toString())) {
                            this.authService.loginStatusSubject.next(true);
                            this.router.navigate([AvailableRoutes.UserDashboard]);
                        }
                    },
                    (error: any) => {
                        console.log("error in fetching current - user from server: " + error);
                    }
                );
            },
            (error: any) => {
                console.log(error);
                // this.snackBar.open("Some error occured.", "Cancel", { duration: 2000 });
                Swal.fire({
                    icon: "error",
                    title: "Error in user login",
                    text: "Something went wrong!",
                });
            }
        );
    }

    validateLoginForm(): boolean {
        // null checks
        if (
            this.loginFormData.username == null ||
            this.loginFormData.password == null ||
            this.loginFormData.username == "" ||
            this.loginFormData.password == ""
        ) {
            this.snackBar.open("All Fields are mandatory.", "OK", { duration: 5000 });
            return false;
        }

        // username: 3<len<255
        const usernameRegex: RegExp = /^[a-zA-Z0-9_]{3,255}$/;
        if (!usernameRegex.test(this.loginFormData.username.valueOf())) {
            this.snackBar.open("Username should be 3 to 255 characters long.", "OK", {
                duration: 5000,
            });
            return false;
        }

        // password: 6<len<255
        const passLen: number = this.loginFormData.password.length;
        if (passLen < 6 || passLen > 255) {
            this.snackBar.open("Password must be 6 to 255 characters long.", "OK", {
                duration: 3000,
            });
            return false;
        }

        return true;
    }
}
