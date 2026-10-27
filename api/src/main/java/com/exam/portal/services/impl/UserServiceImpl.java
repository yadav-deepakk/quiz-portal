package com.exam.portal.services.impl;

import java.security.Principal;
import java.util.Optional;
import java.util.Set;

import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.portal.entities.User;
import com.exam.portal.entities.UserRole;
import com.exam.portal.repositories.RoleRepo;
import com.exam.portal.repositories.UserRepo;
import com.exam.portal.services.UserService;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UserRepo userRepo;

	@Autowired
	private RoleRepo roleRepo;

	private Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

	@Override
	public User createUser(User user, Set<UserRole> userRoles) {
		Optional<User> local = userRepo.findByUsername(user.getUsername());
		if (local.isEmpty()) {
			for (UserRole ur : userRoles) {
				roleRepo.save(ur.getRole());
			}
			user.getUserRoles().addAll(userRoles);
			User u = userRepo.save(user);
			return u;
		} else {
			log.info("User: " + user.getUsername() + ", already present.");
			return null;
		}
	}

	@Override
	public User getUserByUsername(String userName) {
		return userRepo.findByUsername(userName).get();
	}

	@Override
	public boolean updateUserInfo(String userName, User user) {
		Optional<User> local = userRepo.findByUsername(user.getUsername());

		if (!local.isEmpty()) {
			User localUser = local.get();
			if (user.getEmail() != null)
				localUser.setEmail(user.getEmail());
			if (user.getFirstName() != null)
				localUser.setFirstName(user.getFirstName());
			if (user.getLastName() != null)
				localUser.setLastName(user.getLastName());
			if (user.getPhone() != null)
				localUser.setPhone(user.getPhone());
			if (user.getIsActive() != null)
				localUser.setIsActive(user.getIsActive());
			if (user.getProfile() != null)
				localUser.setProfile(user.getProfile());
			userRepo.save(localUser);
			return true;

		} else {
			log.info("No user found with this username.");
			return false;
		}
	}

	@Override
	public void deleteUserById(Long id) {
		Optional<User> local = this.userRepo.findById(id);
		if (!local.isEmpty()) {
			log.info("user: {} is being deleted...", local);
			this.userRepo.deleteById(id);
		} else {
			log.info("User does not exist into database.");
		}
	}

	@Override
	public boolean hasAdminRole(Principal principal) {
		String username = principal.getName(); 
		User user = this.getUserByUsername(username); 
		boolean isAdmin = false;
		for (UserRole ur : user.getUserRoles()) {
			if (ur.getRole().getRoleName().equalsIgnoreCase("ADMIN")) {
				isAdmin = true;
			}
		}
		return isAdmin;

	}

}
