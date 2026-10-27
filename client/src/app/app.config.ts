import {
    ApplicationConfig,
    importProvidersFrom,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
} from "@angular/core";
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from "@angular/common/http";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from "ngx-ui-loader";

import { routes } from "./app.routes";
import { jwtAuthInterceptor } from "./services/auth.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withInterceptors([jwtAuthInterceptor]), withInterceptorsFromDi()),
        importProvidersFrom(
            NgxUiLoaderModule.forRoot({}),
            NgxUiLoaderHttpModule.forRoot({
                showForeground: true,
            })
        ),
    ],
};
