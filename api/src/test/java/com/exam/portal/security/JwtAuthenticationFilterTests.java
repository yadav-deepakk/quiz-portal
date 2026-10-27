package com.exam.portal.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import com.exam.portal.services.impl.UserDetailsServiceSecurityImpl;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTests {

	@Mock
	private JwtUtilService jwtService;

	@Mock
	private UserDetailsServiceSecurityImpl userDetailsService;

	private JwtAuthenticationFilter filter;
	private MockHttpServletRequest request;
	private MockHttpServletResponse response;
	private MockFilterChain chain;

	@BeforeEach
	void setUp() {
		filter = new JwtAuthenticationFilter();
		ReflectionTestUtils.setField(filter, "jwtService", jwtService);
		ReflectionTestUtils.setField(filter, "userDetailsSecurityServiceImpl", userDetailsService);
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		chain = new MockFilterChain();
		SecurityContextHolder.clearContext();
	}

	@AfterEach
	void tearDown() {
		SecurityContextHolder.clearContext();
	}

	@Test
	void requestWithoutAuthorizationHeaderContinuesUnauthenticated() throws Exception {
		filter.doFilter(request, response, chain);

		assertThat(chain.getRequest()).isNotNull();
		assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
		verify(jwtService, never()).extractUsernameFromToken(org.mockito.ArgumentMatchers.anyString());
	}

	@Test
	void nonBearerAuthorizationHeaderContinuesUnauthenticated() throws Exception {
		request.addHeader(HttpHeaders.AUTHORIZATION, "Basic dXNlcjpwYXNz");

		filter.doFilter(request, response, chain);

		assertThat(chain.getRequest()).isNotNull();
		assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
		verify(jwtService, never()).extractUsernameFromToken(org.mockito.ArgumentMatchers.anyString());
	}

	@Test
	void validBearerTokenAuthenticatesTheRequest() throws Exception {
		UserDetails details = User.withUsername("alice").password("pwd").authorities("NORMAL").build();
		request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer valid-token");
		when(jwtService.extractUsernameFromToken("valid-token")).thenReturn("alice");
		when(userDetailsService.loadUserByUsername("alice")).thenReturn(details);
		when(jwtService.isTokenValid("valid-token", details)).thenReturn(true);

		filter.doFilter(request, response, chain);

		assertThat(chain.getRequest()).isNotNull();
		assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
		assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(details);
	}

	@Test
	void invalidBearerTokenContinuesUnauthenticated() throws Exception {
		UserDetails details = User.withUsername("alice").password("pwd").authorities("NORMAL").build();
		request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer expired-token");
		when(jwtService.extractUsernameFromToken("expired-token")).thenReturn("alice");
		when(userDetailsService.loadUserByUsername("alice")).thenReturn(details);
		when(jwtService.isTokenValid("expired-token", details)).thenReturn(false);

		filter.doFilter(request, response, chain);

		assertThat(chain.getRequest()).isNotNull();
		assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
	}

	@Test
	void tokenWithoutSubjectDoesNotAuthenticate() throws Exception {
		request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer subjectless-token");
		when(jwtService.extractUsernameFromToken("subjectless-token")).thenReturn(null);

		filter.doFilter(request, response, chain);

		assertThat(chain.getRequest()).isNotNull();
		assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
		verify(userDetailsService, never()).loadUserByUsername(org.mockito.ArgumentMatchers.anyString());
	}

	@Test
	void alreadyAuthenticatedRequestIsNotOverwritten() throws Exception {
		UsernamePasswordAuthenticationToken existing = new UsernamePasswordAuthenticationToken("existing", null,
				List.of());
		SecurityContextHolder.getContext().setAuthentication(existing);
		request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer valid-token");
		when(jwtService.extractUsernameFromToken("valid-token")).thenReturn("alice");

		filter.doFilter(request, response, chain);

		assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(existing);
		verify(userDetailsService, never()).loadUserByUsername(org.mockito.ArgumentMatchers.anyString());
	}
}
