import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SignUpRequest } from "../models/signup-req";
import { LogInRequest } from "../models/login-req";
import { Observable, Subject } from "rxjs";
import { JwtResponse } from "../models/jwt-response";
import { Authority, UserDetail } from "../models/user";

const baseUrlAuth: string = "http://localhost:8080/api/auth";
const baseUrlUser: string = "http://localhost:8080/user";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    public loginStatusSubject = new Subject<boolean>();

    constructor(private http: HttpClient) {}

    public getCurrentUser(): Observable<UserDetail> {
        return this.http.get<UserDetail>(`${baseUrlUser}/current-user`);
    }

    public signUpUser(signUpRequest: SignUpRequest): Observable<JwtResponse> {
        return this.http.post<JwtResponse>(`${baseUrlAuth}/signup`, signUpRequest);
    }

    public logInUser(logInReqest: LogInRequest): Observable<JwtResponse> {
        return this.http.post<JwtResponse>(`${baseUrlAuth}/login`, logInReqest);
    }

    public isUserLoggedIn(): boolean {
        return localStorage.getItem("access_token") !== null;
    }

    public saveJwt(jwt: string): boolean {
        localStorage.setItem("access_token", jwt);
        return true;
    }

    public saveUser(user: UserDetail): boolean {
        localStorage.setItem("user_detail", JSON.stringify(user));
        return true;
    }

    public getSavedJwt(): string | null {
        return localStorage.getItem("access_token");
    }

    public getCurrentSavedUser(): UserDetail | null {
        const user = localStorage.getItem("user_detail");
        if (!user) {
            this.logoutUser();
            return null;
        }
        return JSON.parse(user) as UserDetail;
    }

    public getUserAuthorities(): Authority[] | null {
        let user = this.getCurrentSavedUser();
        if (user) return user.authorities;
        return null;
    }

    public checkUserHasRole(role: string): boolean {
        let user: UserDetail | null = this.getCurrentSavedUser();
        if (user) {
            let hasRole: boolean = false;
            let authorities: Authority[] | null = this.getUserAuthorities();
            authorities?.forEach((ath) => {
                if (ath.authority.valueOf() === role) {
                    hasRole = true;
                }
            });
            return hasRole;
        }
        return false;
    }

    public logoutUser(): void {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_detail");
    }
}
