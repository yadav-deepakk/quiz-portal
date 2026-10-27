package com.exam.portal.entities;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import com.exam.portal.models.Authority;

class UserEntityTests {

	@Test
	void userWithoutRolesHasNoAuthorities() {
		User user = User.builder().username("no-roles").password("pwd").build();

		assertThat(user.getAuthorities()).isEmpty();
	}

	@Test
	void authoritiesAreDerivedFromUserRoles() {
		User user = User.builder().username("admin").password("pwd").build();
		Role adminRole = Role.builder().roleId(1).roleName("ADMIN").build();
		user.getUserRoles().add(UserRole.builder().user(user).role(adminRole).build());

		assertThat(user.getAuthorities()).extracting(GrantedAuthority::getAuthority).containsExactly("ADMIN");
	}

	@Test
	void userDetailsFlagsAndAccessorsReflectTheEntityState() {
		User user = User.builder().username("someone").password("secret").isActive(true).build();

		assertThat(user.getUsername()).isEqualTo("someone");
		assertThat(user.getPassword()).isEqualTo("secret");
		assertThat(user.isEnabled()).isTrue();
		assertThat(user.isAccountNonExpired()).isTrue();
		assertThat(user.isAccountNonLocked()).isTrue();
		assertThat(user.isCredentialsNonExpired()).isTrue();

		user.setIsActive(false);
		assertThat(user.isEnabled()).isFalse();
	}

	@Test
	void authorityExposesItsName() {
		assertThat(new Authority("NORMAL").getAuthority()).isEqualTo("NORMAL");
	}
}
