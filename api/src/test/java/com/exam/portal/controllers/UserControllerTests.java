package com.exam.portal.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;

import com.exam.portal.entities.Role;
import com.exam.portal.entities.User;
import com.exam.portal.entities.UserRole;
import com.exam.portal.repositories.UserRepo;
import com.exam.portal.services.UserService;
import com.exam.portal.support.IntegrationTestSupport;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTests extends IntegrationTestSupport {

	private static final String JWT = HttpHeaders.AUTHORIZATION;

	@Autowired
	private UserRepo userRepo;

	@Autowired
	private UserService userService;

	private User createUser(String username) {
		User user = User.builder().firstName("Created").lastName("User").username(username)
				.email(username + "@example.com").password("pwd").phone("12345").isActive(true).build();
		Set<UserRole> roles = new HashSet<>();
		roles.add(UserRole.builder().user(user).role(Role.builder().roleId(2).roleName("NORMAL").build()).build());
		return userService.createUser(user, roles);
	}

	@Test
	void currentUserReturnsTheAuthenticatedAdmin() throws Exception {
		mockMvc.perform(get("/user/current-user").header(JWT, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("yadav_deepakk"))
				.andExpect(jsonPath("$.firstName").value("deepak"));
	}

	@Test
	void currentUserReturnsTheAuthenticatedNormalUser() throws Exception {
		mockMvc.perform(get("/user/current-user").header(JWT, bearer(userToken())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("ydeep"));
	}

	@Test
	void createNormalUserWithExistingUsernameReturnsEmptyBody() throws Exception {
		mockMvc.perform(post("/user/create").header(JWT, bearer(adminToken()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"firstName":"Duplicate","username":"ydeep","password":"pwd"}
						"""))
				.andExpect(status().isOk())
				.andExpect(content().string(""));
	}

	/**
	 * The JSON payload is deserialized through the no-args constructor, which
	 * (because of Lombok's {@code @Builder.Default}) leaves {@code userRoles} null,
	 * so the controller reports an internal error. This documents the current
	 * behaviour and covers the controller's exception handling branch.
	 */
	@Test
	void createNormalUserWithoutInitialisedRolesReturnsServerError() throws Exception {
		mockMvc.perform(post("/user/create").header(JWT, bearer(adminToken()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"firstName":"New","lastName":"Person","username":"%s","email":"new@example.com","password":"pwd","phone":"12345","isActive":true}
						""".formatted(unique("http-created"))))
				.andExpect(status().isInternalServerError())
				.andExpect(content().string(""));
	}

	@Test
	void updateNormalUserUpdatesAllProvidedFields() throws Exception {
		String username = unique("updated");
		User created = createUser(username);

		mockMvc.perform(put("/user/update").param("username", username)
				.header(JWT, bearer(adminToken())).contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"username":"%s","firstName":"Changed","lastName":"Person","email":"changed@example.com","phone":"98765","isActive":false,"profile":"avatar.png"}
						""".formatted(username)))
				.andExpect(status().isOk())
				.andExpect(content().string("User updation successful."));

		User reloaded = userRepo.findById(created.getUserId()).orElseThrow();
		assertThat(reloaded.getFirstName()).isEqualTo("Changed");
		assertThat(reloaded.getLastName()).isEqualTo("Person");
		assertThat(reloaded.getEmail()).isEqualTo("changed@example.com");
		assertThat(reloaded.getPhone()).isEqualTo("98765");
		assertThat(reloaded.getIsActive()).isFalse();
		assertThat(reloaded.getProfile()).isEqualTo("avatar.png");
	}

	@Test
	void updateNormalUserSucceedsWhenOnlyUsernameIsProvided() throws Exception {
		String username = unique("minimal");
		User created = createUser(username);

		mockMvc.perform(put("/user/update").param("username", username)
				.header(JWT, bearer(adminToken())).contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"username":"%s"}
						""".formatted(username)))
				.andExpect(status().isOk())
				.andExpect(content().string("User updation successful."));

		User reloaded = userRepo.findById(created.getUserId()).orElseThrow();
		assertThat(reloaded.getFirstName()).isEqualTo("Created");
		assertThat(reloaded.getEmail()).isEqualTo(username + "@example.com");
	}

	@Test
	void updateNormalUserReturnsServerErrorForUnknownUser() throws Exception {
		String username = unique("missing");

		mockMvc.perform(put("/user/update").param("username", username)
				.header(JWT, bearer(adminToken())).contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"username":"%s","firstName":"Nobody"}
						""".formatted(username)))
				.andExpect(status().isInternalServerError())
				.andExpect(content().string("Error in user updation."));
	}

	@Test
	void deleteUserRemovesExistingUser() throws Exception {
		User created = createUser(unique("deleted"));

		mockMvc.perform(delete("/user/delete").param("id", created.getUserId().toString())
				.header(JWT, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(content().string("user deletion successful."));

		assertThat(userRepo.findById(created.getUserId())).isEmpty();
	}

	@Test
	void deleteUserIgnoresUnknownId() throws Exception {
		mockMvc.perform(delete("/user/delete").param("id", "999999999").header(JWT, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(content().string("user deletion successful."));
	}
}
