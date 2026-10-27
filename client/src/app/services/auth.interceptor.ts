import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";

import { AuthService } from "./auth.service";

export const jwtAuthInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthService);
    const jwt = authService.getSavedJwt();

    if (jwt) {
        request = request.clone({
            setHeaders: { Authorization: `Bearer ${jwt}` },
        });
    }

    return next(request);
};
