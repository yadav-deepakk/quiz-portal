package com.exam.portal.services.impl;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.portal.entities.Question;
import com.exam.portal.entities.Quiz;
import com.exam.portal.models.QuizResult;
import com.exam.portal.repositories.QuizRepo;
import com.exam.portal.services.QuizService;

@Service
public class QuizServiceImpl implements QuizService {

	@Autowired
	private QuizRepo quizRepo;


	@Override
	public Quiz addQuiz(Quiz quiz) {
		return quizRepo.save(quiz);
	}

	@Override
	public Optional<Quiz> getQuizById(Long quizId) {
		return quizRepo.findById(quizId);
	}

	@Override
	public List<Quiz> getAllQuizzes() {
		return quizRepo.findAll();
	}

	@Override
	public Quiz updateQuiz(Quiz quiz) {
		return this.addQuiz(quiz);
	}

	@Override
	public boolean deleteQuizById(Long quizId) {
		Optional<Quiz> quiz = quizRepo.findById(quizId);
		if (quiz.isEmpty())
			return false;

		quizRepo.delete(quiz.get());
		return true;
	}

}
