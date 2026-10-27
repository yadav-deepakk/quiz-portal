package com.exam.portal.services;

import java.util.List;
import java.util.Optional;

import com.exam.portal.entities.Quiz;

public interface QuizService {
	public Quiz addQuiz(Quiz quiz);

	public Optional<Quiz> getQuizById(Long quizId);

	public List<Quiz> getAllQuizzes();

	public Quiz updateQuiz(Quiz quiz);

	public boolean deleteQuizById(Long quizId);

}
