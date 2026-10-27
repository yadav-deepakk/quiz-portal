package com.exam.portal.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuizResult {
	Integer totalQuestionCount;
	Integer attemptedQuestionCount;
	Integer correctAnswerCount;
	Float score;
}
