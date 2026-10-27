import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MATERIAL_MODULES } from "@app/shared/material-imports";
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AvailableRoutes } from "@app/app.enum";
import { JwtResponse } from "@app/models/jwt-response";
import { SignUpRequest } from "@app/models/signup-req";
import { AuthService } from "@app/services/auth.service";
import Swal from "sweetalert2";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ...MATERIAL_MODULES],
    selector: "app-signup",
    templateUrl: "./signup.component.html",
    styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
    public appRoutes = AvailableRoutes;
    public hidePassword = true;

    public signUpFormData: SignUpRequest = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        username: "",
        password: "",
    };

    constructor(private snackBar: MatSnackBar, private authService: AuthService) {}

    ngOnInit(): void {}

    onSignUpSubmit() {
        let isSignUpFormValid: boolean = true; // this.doSignUpFormValidation();
        if (!isSignUpFormValid) return;

        console.log("submitting sign up details...");
        console.log(this.signUpFormData);

        this.authService.signUpUser(this.signUpFormData).subscribe(
            (data: JwtResponse) => {
                console.log(data);
                // this.snackBar.open("User creation has been done successfully.", "OK", { duration: 2000 });
                Swal.fire({
                    title: "Success",
                    text: "User creation has been done successfully.",
                    icon: "success",
                });
            },
            (error: any) => {
                console.log(error);
                // this.snackBar.open("Some error occured.", "Cancel", { duration: 2000 });
                Swal.fire({
                    icon: "error",
                    title: "Error in user creation",
                    text: "Something went wrong!",
                    footer: "Username may have already taken Or service may be down",
                });
            }
        );
    }

    doSignUpFormValidation(): boolean {
        // empty/null checks
        if (
            this.signUpFormData.firstName == null ||
            this.signUpFormData.lastName == null ||
            this.signUpFormData.username == null ||
            this.signUpFormData.email == null ||
            this.signUpFormData.password == null ||
            this.signUpFormData.phone == null ||
            this.signUpFormData.firstName.trim() == "" ||
            this.signUpFormData.lastName.trim() == "" ||
            this.signUpFormData.username.trim() == "" ||
            this.signUpFormData.email.trim() == "" ||
            this.signUpFormData.password.trim() == "" ||
            this.signUpFormData.phone.trim() == ""
        ) {
            this.snackBar.open("All fields are mandatory to fill!", "OK", { duration: 3000 });
            return false;
        }

        var nameRegex: RegExp = /^[a-zA-Z]{1,255}$/;
        var emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var phoneRegex: RegExp = /^[0-9]{10}$/;
        var usernameRegex: RegExp = /^[a-zA-Z0-9_]{3,255}$/;

        // firstName: only alphabets and less than 255 character.
        if (!nameRegex.test(this.signUpFormData.firstName.valueOf())) {
            this.snackBar.open(
                "First Name should only have  alphabets and of length between 1 and 255 characters",
                "OK",
                {
                    duration: 5000,
                }
            );
            return false;
        }

        // lastName: only alphabets and less than 255 character
        if (!nameRegex.test(this.signUpFormData.lastName.valueOf())) {
            this.snackBar.open(
                "Last Name should only have alphabets and of length between 1 and 255 characters!",
                "OK",
                {
                    duration: 5000,
                }
            );
            return false;
        }

        // email: must have only 1 occurance of @ symbol and after @ symbol a dot(.) symbol after @ (eg. user@email.com)
        if (!emailRegex.test(this.signUpFormData.email.valueOf())) {
            this.snackBar.open("Enter a valid email!", "OK", {
                duration: 3000,
            });
            return false;
        }

        // phone no.: len == 10, must be digits only 0 to 9
        if (!phoneRegex.test(this.signUpFormData.phone.valueOf())) {
            this.snackBar.open("Enter a phone number of 10 digits!", "OK", {
                duration: 4000,
            });
            return false;
        }

        // username: 3<len<255 and allowed chracters are a-z, 0-9, underscore(_)
        if (!usernameRegex.test(this.signUpFormData.username.valueOf())) {
            this.snackBar.open(
                "Username should be 3 to 255 characters long! \nIt can only have lowercase aplphabets, digits, underscore(_)",
                "OK",
                {
                    duration: 5000,
                }
            );
            return false;
        }

        // password: 6<len<255 and must have 1 capital letter, 1 digit, 1 allowed special symbol('!@#$%^&*()[]{}.')
        const pass: string = this.signUpFormData.password;
        const passLen: number = this.signUpFormData.password.length;
        if (
            passLen < 6 ||
            passLen > 255 ||
            !/[A-Z]/.test(pass.valueOf()) ||
            !/\d/.test(pass.valueOf()) ||
            !/[!@#$%^&*()[\]{}./]/.test(pass.valueOf())
        ) {
            this.snackBar.open(
                "Password must be 6 to 255 characters long. It should contain at least one uppercase letter, one digit and atleast an allowed special symbol from !@#$%^&*()[]{}.",
                "OK",
                {
                    duration: 10000,
                }
            );
            return false;
        }

        // all checks are done, so form is valid!
        return true;
    }
}
