package com.exam.portal.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRole {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long userRoleId;

	@ManyToOne(fetch = FetchType.EAGER)
	private Role role;

	@ManyToOne
	private User user;

}
