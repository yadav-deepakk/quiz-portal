package com.exam.portal.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MvcResult;

import com.exam.portal.entities.User;
import com.exam.portal.repositories.UserRepo;
import com.exam.portal.support.IntegrationTestSupport;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthenticationIntegrationTests extends IntegrationTestSupport {

	@Autowired
	private UserRepo userRepo;

	@Test
	void loginWithSeededNormalUserReturnsJwtToken() throws Exception {
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content(loginJson("ydeep", "test")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("ydeep"))
				.andExpect(jsonPath("$.jwt").isNotEmpty());
	}

	@Test
	void loginWithSeededAdminUserReturnsJwtToken() throws Exception {
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content(loginJson("yadav_deepakk", "D999")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("yadav_deepakk"))
				.andExpect(jsonPath("$.jwt").isNotEmpty());
	}

	@Test
	void loginWithWrongPasswordIsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content(loginJson("ydeep", "wrong-password")))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.error").value("Unauthorized"))
				.andExpect(jsonPath("$.path").isString());
	}

	@Test
	void loginWithUnknownUserIsUnauthorized() throws Exception {
		String username = unique("ghost");
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content(loginJson(username, "whatever")))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401));
	}

	@Test
	void signUpCreatesNormalUserAndReturnsToken() throws Exception {
		String username = unique("signup");
		String password = "secret123";

		MvcResult signUpResult = mockMvc
				.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
						.content(signUpJson(username, password)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value(username))
				.andExpect(jsonPath("$.jwt").isNotEmpty())
				.andReturn();

		String token = readJson(signUpResult.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.jwt");

		User created = userRepo.findByUsername(username).orElseThrow();
		assertThat(created.getProfile()).isEqualTo("default.png");
		assertThat(created.getUserRoles()).hasSize(1);
		assertThat(created.getUserRoles().iterator().next().getRole().getRoleName()).isEqualTo("NORMAL");

		// The token returned by signup can be used against a protected endpoint.
		mockMvc.perform(get("/user/current-user").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value(username));
	}

	@Test
	void signUpWithExistingUsernameReturnsEmptyBody() throws Exception {
		mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
				.content(signUpJson("ydeep", "test")))
				.andExpect(status().isOk())
				.andExpect(content().string(""));
	}

	@Test
	void loginEndpointAllowsConfiguredCorsOrigin() throws Exception {
		mockMvc.perform(post("/api/auth/login")
				.header(HttpHeaders.ORIGIN, "http://localhost:4200")
				.contentType(MediaType.APPLICATION_JSON)
				.content(loginJson("ydeep", "test")))
				.andExpect(status().isOk())
				.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200"));
	}

	@Test
	void preflightRequestIsAllowedAndAdvertisesConfiguredOrigin() throws Exception {
		mockMvc.perform(options("/user/current-user")
				.header(HttpHeaders.ORIGIN, "http://localhost:4200")
				.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
				.andExpect(status().isOk())
				.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200"));
	}

	@Test
	void protectedEndpointWithoutTokenReturnsUnauthorizedJson() throws Exception {
		mockMvc.perform(get("/category"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.error").value("Unauthorized"))
				.andExpect(jsonPath("$.path").isString());
	}
}
