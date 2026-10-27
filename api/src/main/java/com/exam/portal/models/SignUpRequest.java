package com.exam.portal.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequest {
	private String firstName;
	private String lastName;
	private String username;
	private String email;
	private String password;
	private String phone;
}
