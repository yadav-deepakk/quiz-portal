package com.exam.portal.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.exam.portal.entities.User;
import com.exam.portal.repositories.UserRepo;

@Service
public class UserDetailsServiceSecurityImpl implements UserDetailsService {

	@Autowired
	UserRepo userRepo;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		return userRepo.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

	}

}
