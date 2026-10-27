package com.exam.portal.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.exam.portal.entities.User;
import com.exam.portal.entities.UserRole;
import com.exam.portal.services.UserService;

@ExtendWith(MockitoExtension.class)
class UserControllerUnitTests {

	@Mock
	private UserService userService;

	@InjectMocks
	private UserController userController;

	@Test
	void currentUserReturnsNotFoundWhenServiceReturnsNull() {
		when(userService.getUserByUsername("ghost")).thenReturn(null);

		ResponseEntity<User> response = userController.getCurrentUser(() -> "ghost");

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
		assertThat(response.getBody()).isNull();
	}

	@Test
	void currentUserReturnsNotFoundWhenServiceThrows() {
		when(userService.getUserByUsername("ghost")).thenThrow(new IllegalStateException("boom"));

		ResponseEntity<User> response = userController.getCurrentUser(() -> "ghost");

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void createUserReturnsServerErrorWhenServiceThrows() {
		when(userService.createUser(any(User.class), any())).thenThrow(new IllegalStateException("boom"));

		ResponseEntity<User> response = userController.createNormalUser(User.builder().username("broken").build());

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
		assertThat(response.getBody()).isNull();
	}

	@Test
	void updateUserReturnsServerErrorWhenServiceThrows() {
		when(userService.updateUserInfo(anyString(), any(User.class))).thenThrow(new IllegalStateException("boom"));

		ResponseEntity<String> response = userController.updateNormalUser("someone", User.builder().username("someone").build());

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
		assertThat(response.getBody()).isEqualTo("Error in user updation.");
	}

	@Test
	void deleteUserReturnsServerErrorWhenServiceThrows() {
		doThrow(new IllegalStateException("boom")).when(userService).deleteUserById(42L);

		ResponseEntity<String> response = userController.deleteUserByUserId(42L);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
		assertThat(response.getBody()).isEqualTo("Error in user deletion.");
	}

	@Test
	void deleteUserReturnsSuccessMessage() {
		ResponseEntity<String> response = userController.deleteUserByUserId(42L);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isEqualTo("user deletion successful.");
	}

	@Test
	void updateUserReturnsSuccessMessage() {
		when(userService.updateUserInfo(anyString(), any(User.class))).thenReturn(true);

		ResponseEntity<String> response = userController.updateNormalUser("someone", User.builder().username("someone").build());

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isEqualTo("User updation successful.");
	}

	@Test
	void updateUserReturnsServerErrorWhenServiceReportsFailure() {
		when(userService.updateUserInfo(anyString(), any(User.class))).thenReturn(false);

		ResponseEntity<String> response = userController.updateNormalUser("someone", User.builder().username("someone").build());

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@Test
	void createUserReturnsInsertedUser() {
		User created = User.builder().userId(7L).username("new-user").profile("default.png").build();
		when(userService.createUser(any(User.class), any(Set.class))).thenReturn(created);

		ResponseEntity<User> response = userController.createNormalUser(User.builder().username("new-user").build());

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isSameAs(created);
	}
}
