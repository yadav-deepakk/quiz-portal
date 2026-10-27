# Client (Angular 22)

Frontend for the Exam Portal. This project has been upgraded to Angular 22 and uses
the `@angular/build` application builder with Vitest for unit tests.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application
reloads automatically when source files change.

The app expects the Spring Boot backend at `http://localhost:8080`.

## Build

Run `npm run build` to build the project. The build artifacts are stored in the
`dist/client` directory.

## Running unit tests

Run `npm test` to execute the unit tests with Vitest.

Run `npm run test:coverage` to execute the tests with coverage. The build fails
if statements, branches, functions, or lines fall below 80%. The HTML report is
written to `coverage/client/index.html`.

## Code scaffolding

Run `npx ng generate component component-name` to generate a new component. You can
also use `npx ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Further help

To get more help on the Angular CLI use `npx ng help` or visit the
[Angular CLI documentation](https://angular.dev/cli).
