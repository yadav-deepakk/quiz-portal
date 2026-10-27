package com.exam.portal.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import com.exam.portal.entities.User;
import com.exam.portal.models.JwtResponse;
import com.exam.portal.models.LogInRequest;
import com.exam.portal.models.SignUpRequest;
import com.exam.portal.repositories.UserRepo;

@SpringBootTest
@ActiveProfiles("test")
class AuthenticateServiceTests {

	@Autowired
	private AuthenticateService authenticateService;

	@Autowired
	private UserRepo userRepo;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private SignUpRequest signUpRequest(String username) {
		return SignUpRequest.builder().firstName("New").lastName("Person").username(username)
				.email(username + "@example.com").password("secret").phone("9999999999").build();
	}

	@Test
	void signUpPersistsUserWithNormalRoleAndReturnsToken() {
		String username = "authservice" + System.nanoTime();

		JwtResponse response = authenticateService.signUp(signUpRequest(username));

		assertThat(response).isNotNull();
		assertThat(response.getUsername()).isEqualTo(username);
		assertThat(response.getJwt()).isNotBlank();

		User stored = userRepo.findByUsername(username).orElseThrow();
		assertThat(passwordEncoder.matches("secret", stored.getPassword())).isTrue();
		assertThat(stored.getUserRoles()).hasSize(1);
		assertThat(stored.getUserRoles().iterator().next().getRole().getRoleName()).isEqualTo("NORMAL");
	}

	@Test
	void signUpWithDuplicateUsernameReturnsNull() {
		JwtResponse response = authenticateService.signUp(signUpRequest("ydeep"));

		assertThat(response).isNull();
	}

	@Test
	void logInWithValidCredentialsReturnsToken() {
		JwtResponse response = authenticateService
				.logIn(LogInRequest.builder().username("ydeep").password("test").build());

		assertThat(response).isNotNull();
		assertThat(response.getUsername()).isEqualTo("ydeep");
		assertThat(response.getJwt()).isNotBlank();
	}

	@Test
	void logInWithWrongPasswordThrowsAuthenticationException() {
		LogInRequest request = LogInRequest.builder().username("ydeep").password("nope").build();

		assertThatThrownBy(() -> authenticateService.logIn(request)).isInstanceOf(AuthenticationException.class);
	}

	@Test
	void logInWithUnknownUsernameThrowsAuthenticationException() {
		LogInRequest request = LogInRequest.builder().username("does-not-exist-" + System.nanoTime())
				.password("nope").build();

		assertThatThrownBy(() -> authenticateService.logIn(request)).isInstanceOf(AuthenticationException.class);
	}
}
