package com.exam.portal.services.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.Principal;
import java.util.HashSet;
import java.util.NoSuchElementException;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.context.ActiveProfiles;

import com.exam.portal.entities.Role;
import com.exam.portal.entities.User;
import com.exam.portal.entities.UserRole;
import com.exam.portal.repositories.UserRepo;

@SpringBootTest
@ActiveProfiles("test")
class UserServiceTests {

	@Autowired
	private UserServiceImpl userService;

	@Autowired
	private UserDetailsServiceSecurityImpl userDetailsService;

	@Autowired
	private UserRepo userRepo;

	private User buildUser(String username) {
		return User.builder().firstName("First").lastName("Last").username(username)
				.email(username + "@example.com").phone("1234567890").password("pwd").profile("default.png")
				.build();
	}

	private User createUser(String username) {
		User user = buildUser(username);
		Role role = Role.builder().roleId(2).roleName("NORMAL").build();
		Set<UserRole> roles = new HashSet<>();
		roles.add(UserRole.builder().user(user).role(role).build());
		return userService.createUser(user, roles);
	}

	private static Principal principal(String username) {
		return () -> username;
	}

	@Test
	void createUserPersistsNewUserAndRoles() {
		String username = "svc-create-" + System.nanoTime();

		User created = createUser(username);

		assertThat(created).isNotNull();
		assertThat(created.getUserId()).isNotNull();
		assertThat(userRepo.findByUsername(username)).isPresent();
	}

	@Test
	void createUserWithExistingUsernameReturnsNull() {
		User duplicate = buildUser("ydeep");
		Set<UserRole> roles = new HashSet<>();
		roles.add(UserRole.builder().user(duplicate).role(Role.builder().roleId(2).roleName("NORMAL").build())
				.build());

		assertThat(userService.createUser(duplicate, roles)).isNull();
	}

	@Test
	void getUserByUsernameReturnsStoredUser() {
		assertThat(userService.getUserByUsername("ydeep").getUsername()).isEqualTo("ydeep");
	}

	@Test
	void getUserByUsernameThrowsForUnknownUser() {
		assertThatThrownBy(() -> userService.getUserByUsername("missing-" + System.nanoTime()))
				.isInstanceOf(NoSuchElementException.class);
	}

	@Test
	void updateUserInfoUpdatesEveryProvidedField() {
		String username = "svc-update-" + System.nanoTime();
		createUser(username);
		User update = User.builder().username(username).firstName("Changed").lastName("Name").email("changed@x.com")
				.phone("555").isActive(false).profile("avatar.png").build();

		boolean updated = userService.updateUserInfo("ignored-parameter", update);

		assertThat(updated).isTrue();
		User reloaded = userRepo.findByUsername(username).orElseThrow();
		assertThat(reloaded.getFirstName()).isEqualTo("Changed");
		assertThat(reloaded.getLastName()).isEqualTo("Name");
		assertThat(reloaded.getEmail()).isEqualTo("changed@x.com");
		assertThat(reloaded.getPhone()).isEqualTo("555");
		assertThat(reloaded.getIsActive()).isFalse();
		assertThat(reloaded.getProfile()).isEqualTo("avatar.png");
	}

	@Test
	void updateUserInfoLeavesFieldsAloneWhenTheyAreNull() {
		String username = "svc-update-nulls-" + System.nanoTime();
		createUser(username);
		User update = new User();
		update.setUsername(username);
		update.setIsActive(null);

		boolean updated = userService.updateUserInfo(username, update);

		assertThat(updated).isTrue();
		User reloaded = userRepo.findByUsername(username).orElseThrow();
		assertThat(reloaded.getFirstName()).isEqualTo("First");
		assertThat(reloaded.getEmail()).isEqualTo(username + "@example.com");
	}

	@Test
	void updateUserInfoReturnsFalseForUnknownUser() {
		User update = User.builder().username("missing-" + System.nanoTime()).firstName("Nobody").build();

		assertThat(userService.updateUserInfo("missing", update)).isFalse();
	}

	@Test
	void deleteUserByIdRemovesExistingUser() {
		String username = "svc-delete-" + System.nanoTime();
		User created = createUser(username);

		userService.deleteUserById(created.getUserId());

		assertThat(userRepo.findById(created.getUserId())).isEmpty();
	}

	@Test
	void deleteUserByIdIgnoresUnknownUser() {
		userService.deleteUserById(Long.MAX_VALUE);
	}

	@Test
	void hasAdminRoleIsTrueForAdminPrincipal() {
		assertThat(userService.hasAdminRole(principal("yadav_deepakk"))).isTrue();
	}

	@Test
	void hasAdminRoleIsFalseForNormalPrincipal() {
		assertThat(userService.hasAdminRole(principal("ydeep"))).isFalse();
	}

	@Test
	void userDetailsServiceLoadsKnownUser() {
		assertThat(userDetailsService.loadUserByUsername("ydeep").getUsername()).isEqualTo("ydeep");
	}

	@Test
	void userDetailsServiceThrowsForUnknownUser() {
		assertThatThrownBy(() -> userDetailsService.loadUserByUsername("unknown-" + System.nanoTime()))
				.isInstanceOf(UsernameNotFoundException.class);
	}
}
