package com.exam.portal.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Question {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long questionId;

	@Column(length = 5000, nullable = false)
	private String questionContent;

	@Column(nullable = true)
	private String image;

	private String option1;
	private String option2;
	private String option3;
	private String option4;

	private String answer;
	
	@Transient
	private String givenAnswer; 

	@ManyToOne
	private Quiz quiz;
}
