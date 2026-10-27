package com.exam.portal.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.jayway.jsonpath.JsonPath;

/**
 * Shared helpers for the MockMvc based integration tests. Test data is always
 * created with a random suffix so that tests can run in any order against the
 * shared, in-memory H2 database.
 */
public abstract class IntegrationTestSupport {

	@Autowired
	protected MockMvc mockMvc;

	protected static String unique(String prefix) {
		return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
	}

	protected static String bearer(String token) {
		return "Bearer " + token;
	}

	protected static String readJson(String content, String path) {
		return JsonPath.read(content, path);
	}

	protected String tokenFor(String username, String password) throws Exception {
		MvcResult result = mockMvc
				.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
						.content(loginJson(username, password)))
				.andExpect(status().isOk()).andReturn();
		return readJson(result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.jwt");
	}

	protected String adminToken() throws Exception {
		return tokenFor("yadav_deepakk", "D999");
	}

	protected String userToken() throws Exception {
		return tokenFor("ydeep", "test");
	}

	protected static String loginJson(String username, String password) {
		return """
				{"username":"%s","password":"%s"}
				""".formatted(username, password);
	}

	protected static String signUpJson(String username, String password) {
		return """
				{"firstName":"Test","lastName":"User","username":"%s","email":"%s@example.com","password":"%s","phone":"1234567890"}
				""".formatted(username, username, password);
	}
}
