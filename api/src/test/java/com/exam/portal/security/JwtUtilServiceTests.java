package com.exam.portal.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import io.jsonwebtoken.Claims;

class JwtUtilServiceTests {

	private JwtUtilService jwtUtilService;

	@BeforeEach
	void setUp() {
		jwtUtilService = new JwtUtilService();
		String secret = Base64.getEncoder()
				.encodeToString("0123456789abcdef0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.UTF_8));
		ReflectionTestUtils.setField(jwtUtilService, "SECRET_KEY", secret);
		ReflectionTestUtils.setField(jwtUtilService, "JWT_TOKEN_VALIDITY", 3_600_000L);
	}

	private UserDetails user(String username) {
		return User.withUsername(username).password("pwd").authorities("NORMAL").build();
	}

	@Test
	void generatedTokenCanBeValidatedForSameUser() {
		UserDetails alice = user("alice");

		String token = jwtUtilService.generateToken(alice);

		assertThat(token).isNotBlank();
		assertThat(jwtUtilService.extractUsernameFromToken(token)).isEqualTo("alice");
		assertThat(jwtUtilService.extractAllClaims(token).getSubject()).isEqualTo("alice");
		assertThat(jwtUtilService.isTokenValid(token, alice)).isTrue();
	}

	@Test
	void extraClaimsAreEmbeddedInToken() {
		String token = jwtUtilService.doGenerateToken(Map.of("role", "ADMIN"), user("bob"));

		assertThat(jwtUtilService.extractClaims(token, (Claims claims) -> claims.get("role", String.class)))
				.isEqualTo("ADMIN");
	}

	@Test
	void tokenIsNotValidForAnotherUser() {
		String token = jwtUtilService.generateToken(user("alice"));

		assertThat(jwtUtilService.isTokenValid(token, user("carol"))).isFalse();
	}

	@Test
	void expiredTokenIsRejected() {
		ReflectionTestUtils.setField(jwtUtilService, "JWT_TOKEN_VALIDITY", -60_000L);
		UserDetails alice = user("alice");

		String expiredToken = jwtUtilService.generateToken(alice);

		// JJWT refuses to parse an expired token, so validation surfaces the failure
		// as an ExpiredJwtException instead of returning false.
		assertThatThrownBy(() -> jwtUtilService.isTokenValid(expiredToken, alice))
				.isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
	}

	@Test
	void malformedTokenCannotBeParsed() {
		assertThatThrownBy(() -> jwtUtilService.extractUsernameFromToken("not-a-jwt"))
				.isInstanceOf(RuntimeException.class);
	}
}
