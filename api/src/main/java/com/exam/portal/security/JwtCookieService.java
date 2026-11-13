package com.exam.portal.security;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Writes and reads the JWT from an HttpOnly cookie so that browser clients never
 * have to keep the token in JavaScript accessible storage.
 */
@Service
public class JwtCookieService {

	public static final String COOKIE_NAME = "access_token";

	@Value("${jwt.token.validity_millisec}")
	private long tokenValidityMillis;

	@Value("${app.jwt.cookie-secure:false}")
	private boolean secure;

	@Value("${app.jwt.cookie-same-site:Lax}")
	private String sameSite;

	public void addTokenCookie(HttpServletResponse response, String token) {
		response.addHeader(HttpHeaders.SET_COOKIE,
				buildCookie(token, Duration.ofMillis(tokenValidityMillis)).toString());
	}

	public void clearTokenCookie(HttpServletResponse response) {
		response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("", Duration.ZERO).toString());
	}

	public String extractToken(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}

		for (Cookie cookie : cookies) {
			if (COOKIE_NAME.equals(cookie.getName())) {
				String value = cookie.getValue();
				return value == null || value.isBlank() ? null : value;
			}
		}

		return null;
	}

	private ResponseCookie buildCookie(String value, Duration maxAge) {
		return ResponseCookie.from(COOKIE_NAME, value)
				.httpOnly(true)
				.secure(secure)
				.path("/")
				.sameSite(sameSite)
				.maxAge(maxAge)
				.build();
	}
}
