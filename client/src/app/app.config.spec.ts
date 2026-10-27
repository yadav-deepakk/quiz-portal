import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { appConfig } from "./app.config";
import { routes } from "./app.routes";

describe("appConfig", () => {
    it("should define the application providers", () => {
        expect(appConfig.providers).toBeTruthy();
        expect(appConfig.providers!.length).toBe(5);
    });

    it("should configure the router with the application routes", () => {
        TestBed.configureTestingModule({ providers: appConfig.providers });

        const router = TestBed.inject(Router);

        expect(router.config).toEqual(routes);
        expect(router.config.some((route) => route.path === "admin")).toBe(true);
        expect(router.config.some((route) => route.path === "user")).toBe(true);
    });
});
