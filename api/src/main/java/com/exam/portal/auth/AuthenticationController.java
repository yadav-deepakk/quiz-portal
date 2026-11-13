package com.exam.portal.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.exam.portal.models.JwtResponse;
import com.exam.portal.models.LogInRequest;
import com.exam.portal.models.SignUpRequest;
import com.exam.portal.security.JwtCookieService;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("api/auth")
@CrossOrigin(origins = { "http://localhost:4200", "http://localhost:5173", "http://localhost:4173",
		"http://127.0.0.1:5173" }, methods = { RequestMethod.POST })
public class AuthenticationController {

	@Autowired
	AuthenticateService authService;

	@Autowired
	JwtCookieService jwtCookieService;

	@PostMapping("login")
	public ResponseEntity<JwtResponse> logIn(@RequestBody LogInRequest request, HttpServletResponse response) {
		JwtResponse jwtResponse = authService.logIn(request);
		jwtCookieService.addTokenCookie(response, jwtResponse.getJwt());
		return ResponseEntity.ok(jwtResponse);
	}

	@PostMapping("signup")
	public ResponseEntity<JwtResponse> signUp(@RequestBody SignUpRequest request, HttpServletResponse response) {
		JwtResponse jwtResponse = authService.signUp(request);

		// A duplicate username is reported as an empty 200 response by the service.
		if (jwtResponse == null) {
			return ResponseEntity.ok().build();
		}

		jwtCookieService.addTokenCookie(response, jwtResponse.getJwt());
		return ResponseEntity.ok(jwtResponse);
	}

	@PostMapping("logout")
	public ResponseEntity<Void> logOut(HttpServletResponse response) {
		jwtCookieService.clearTokenCookie(response);
		return ResponseEntity.noContent().build();
	}
}
