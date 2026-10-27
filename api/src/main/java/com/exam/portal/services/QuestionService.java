package com.exam.portal.services;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.exam.portal.entities.Question;
import com.exam.portal.entities.Quiz;
import com.exam.portal.models.QuizResult;

public interface QuestionService {
	public Question addQuestion(Question question);

	public Optional<Question> getQuestionById(Long questionId);

	public Set<Question> getAllQuestions();

	public Question updateQuestion(Question question);

	public boolean deleteQuestionById(Long questionId);

	public List<Question> getQuestionsOfQuizForAdmin(Long quizId);

	public Set<Question> getQuestionsOfQuiz(Long quizId);

	public QuizResult evaluateQuizResult(List<Question> questions);
}
