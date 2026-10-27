package com.exam.portal.controllers;

import java.security.Principal;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.exam.portal.entities.Role;
import com.exam.portal.entities.User;
import com.exam.portal.entities.UserRole;
import com.exam.portal.services.UserService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:4200", methods = { RequestMethod.GET })
public class UserController {
	@Autowired
	private UserService userService;

	private Logger log = LoggerFactory.getLogger(UserController.class);

	@GetMapping("current-user")
	public ResponseEntity<User> getCurrentUser(Principal principal) {
		log.info("GET:/user Principal Name {}", principal.getName());
		try {
			User usr = userService.getUserByUsername(principal.getName());
			if (usr != null) {
				return new ResponseEntity<>(usr, HttpStatus.OK);
			} else
				throw new Exception("No user found in DB");

		} catch (Exception e) {
			log.info("Exception Occured: {}", e.getMessage());
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@PostMapping("/create")
	public ResponseEntity<User> createNormalUser(@RequestBody User user) {
		log.info("POST: /user/create");
		log.info("user: {}", user);
		try {
			user.setProfile("default.png");
			Role normalRole = Role.builder().roleId(2).roleName("NORMAL").build(); // new Role(2, "NORMAL");
			Set<UserRole> userRoleSet = new HashSet<>();
			userRoleSet.add(UserRole.builder().user(user).role(normalRole).build());
			User insertedUser = userService.createUser(user, userRoleSet);
			return new ResponseEntity<>(insertedUser, HttpStatus.OK);

		} catch (Exception e) {
			log.info("Exception Occured: {}", e.getMessage());
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PutMapping("/update")
	public ResponseEntity<String> updateNormalUser(@RequestParam(name = "username", required = true) String username,
			@RequestBody User user) {
		log.info("PUT: /user/update");
		log.info("username=" + username);
		log.info("user: {}", user);
		try {
			boolean updateSuccess = userService.updateUserInfo(username, user);
			if (updateSuccess) {
				return new ResponseEntity<String>("User updation successful.", HttpStatus.OK);
			} else {
				throw new Exception("Error occured in user updation.");
			}

		} catch (Exception e) {
			log.info("Exception Occured: {}", e.getMessage());
			return new ResponseEntity<String>("Error in user updation.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/delete")
	public ResponseEntity<String> deleteUserByUserId(@RequestParam(name = "id", required = true) Long id) {
		log.info("DELETE: /user/delete");
		log.info("id=" + id);
		try {
			userService.deleteUserById(id);
			return new ResponseEntity<String>("user deletion successful.", HttpStatus.OK);
		} catch (Exception e) {
			log.info("Exception Occured: {}", e.getMessage());
			return new ResponseEntity<String>("Error in user deletion.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
