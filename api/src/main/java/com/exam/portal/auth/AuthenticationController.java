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

@RestController
@RequestMapping("api/auth")
@CrossOrigin(origins = "http://localhost:4200", methods = { RequestMethod.POST })
public class AuthenticationController {

	@Autowired
	AuthenticateService authService;

	@PostMapping("login")
	public ResponseEntity<JwtResponse> logIn(@RequestBody LogInRequest request) {
		return ResponseEntity.ok(authService.logIn(request));
	}

	@PostMapping("signup")
	public ResponseEntity<JwtResponse> signUp(@RequestBody SignUpRequest request) {
		return ResponseEntity.ok(authService.signUp(request));
	}
}
