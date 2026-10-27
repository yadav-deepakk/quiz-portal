package com.exam.portal;

import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.exam.portal.entities.Role;
import com.exam.portal.entities.User;
import com.exam.portal.entities.UserRole;
import com.exam.portal.services.UserService;

@SpringBootApplication
public class ExamPortalApplication implements CommandLineRunner {

	@Autowired
	PasswordEncoder passwordEncoder;

	@Autowired
	UserService userService;

	Logger log = LoggerFactory.getLogger(ExamPortalApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(ExamPortalApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		try {
			log.info("Creation of an ADMIN User ...");

			User adminUser = User.builder().firstName("deepak").lastName("yadav").username("yadav_deepakk")
					.email("deepak@yadav.com").phone("+91 9911223344").password(passwordEncoder.encode("D999"))
					.profile("default.png").isActive(true).build();
			Role adminRole = Role.builder().roleId(1).roleName("ADMIN").build(); // new Role(1, "ADMIN");
			UserRole userRole = UserRole.builder().user(adminUser).role(adminRole).build();
			Set<UserRole> adminUserRoleSet = new HashSet<>();
			adminUserRoleSet.add(userRole);
			userService.createUser(adminUser, adminUserRoleSet);

			log.info("ADMIN User Creation Done ...");

			log.info("Creation of a Normaml Test User ...");

			User normalTestUser = User.builder().firstName("deep").lastName("y").username("ydeep")
					.email("deep@email.com").phone("+91 9911223344").password(passwordEncoder.encode("test"))
					.profile("default.png").isActive(true).build();
			Role normalRole = Role.builder().roleId(2).roleName("NORMAL").build(); // new Role(1, "ADMIN");
			UserRole normalUserRole = UserRole.builder().user(normalTestUser).role(normalRole).build();
			Set<UserRole> normalUserRoleSet = new HashSet<>();
			normalUserRoleSet.add(normalUserRole);
			userService.createUser(normalTestUser, normalUserRoleSet);

			log.info("NORMAL Test User Creation Done ...");

		} catch (Exception e) {
			log.info(e.getMessage());
		}

	}

}
