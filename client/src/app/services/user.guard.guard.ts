import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { AvailableRoutes, UserRolesEnum } from "../app.enum";
import { AuthService } from "./auth.service";

export const adminUserGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.checkUserHasRole(UserRolesEnum.ADMIN)) return true;
    if (authService.checkUserHasRole(UserRolesEnum.NORMAL)) return router.createUrlTree([AvailableRoutes.UserDashboard]);
    if (!authService.isUserLoggedIn()) return router.createUrlTree([AvailableRoutes.Login]);
    return false;
};

export const normalUserGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.checkUserHasRole(UserRolesEnum.NORMAL)) return true;
    if (authService.checkUserHasRole(UserRolesEnum.ADMIN)) return router.createUrlTree([AvailableRoutes.AdminDashboard]);
    if (!authService.isUserLoggedIn()) return router.createUrlTree([AvailableRoutes.Login]);
    return false;
};

export const nonLoggedInUserGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isUserLoggedIn()) return true;
    if (authService.checkUserHasRole(UserRolesEnum.ADMIN)) return router.createUrlTree([AvailableRoutes.AdminDashboard]);
    if (authService.checkUserHasRole(UserRolesEnum.NORMAL))
        return router.createUrlTree([AvailableRoutes.UserDashboard]);
    return false;
};
