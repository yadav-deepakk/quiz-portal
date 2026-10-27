package com.exam.portal.models;

import org.springframework.security.core.GrantedAuthority;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Authority implements GrantedAuthority {
	private String authority;

	@Override
	public String getAuthority() {
		return authority;
	}
}
