package com.exam.portal.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.exam.portal.entities.User;

public interface UserRepo extends JpaRepository<User, Long> {
	public Optional<User> findByUsername(String userName);
}
