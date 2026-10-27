package com.exam.portal.services;

import java.security.Principal;
import java.util.Set;

import com.exam.portal.entities.User;
import com.exam.portal.entities.UserRole;

public interface UserService {
	public User createUser(User user, Set<UserRole> userRoles);
	public User getUserByUsername(String userName);
	public boolean updateUserInfo(String userName, User user);
	public void deleteUserById(Long id); 
	public boolean hasAdminRole(Principal principal); 
}
