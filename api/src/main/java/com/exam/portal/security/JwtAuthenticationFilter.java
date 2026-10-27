package com.exam.portal.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.exam.portal.services.impl.UserDetailsServiceSecurityImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	@Autowired
	private JwtUtilService jwtService;

	@Autowired
	private UserDetailsServiceSecurityImpl userDetailsSecurityServiceImpl;

	Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		final String authHeader = request.getHeader("Authorization");
		logger.info("header: {}", authHeader);

		if (authHeader != null && authHeader.startsWith("Bearer ")) {

			final String jwtToken = authHeader.substring(7);
			final String userEmail = jwtService.extractUsernameFromToken(jwtToken);

			if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

				UserDetails userDetail = userDetailsSecurityServiceImpl.loadUserByUsername(userEmail);

				if (jwtService.isTokenValid(jwtToken, userDetail)) {

					UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
							userDetail, null, userDetail.getAuthorities());
					authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authentication);

				} else
					logger.info("jwt-token validation failed!");
			}

		} else
			logger.info("Invalid Header");

		filterChain.doFilter(request, response);
	}

}