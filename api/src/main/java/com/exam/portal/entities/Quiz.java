package com.exam.portal.entities;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
public class Quiz {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long quizId;

	@Column(length = 1000)
	private String quizTitle;

	@Column(length = 3000)
	private String quizDescription;

	private Integer quizMaxMarks;

	private Integer questionCount;

	@Builder.Default
	private Boolean isActiveQuiz = false;

	@OneToMany(cascade = CascadeType.ALL, mappedBy = "quiz")
	@JsonIgnore
	@Builder.Default
	private List<Question> questionsList = new ArrayList<>();

	@ManyToOne
	private Category category;
}
