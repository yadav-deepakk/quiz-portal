package com.exam.portal.services.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.exam.portal.entities.Category;
import com.exam.portal.entities.Question;
import com.exam.portal.entities.Quiz;
import com.exam.portal.repositories.CategoryRepo;
import com.exam.portal.repositories.QuestionRepo;
import com.exam.portal.repositories.QuizRepo;
import com.exam.portal.services.QuestionService;

/**
 * These tests intentionally run without a test-managed transaction. Production
 * disables open-in-view, so the quiz's lazy question collection can only be
 * read when the service opens its own transaction.
 */
@SpringBootTest
@ActiveProfiles("test")
class QuestionServiceLazyLoadingTests {

	@Autowired
	private QuestionService questionService;

	@Autowired
	private CategoryRepo categoryRepo;

	@Autowired
	private QuizRepo quizRepo;

	@Autowired
	private QuestionRepo questionRepo;

	private record QuizFixture(Quiz quiz, Category category, List<Long> questionIds) {
	}

	private QuizFixture createQuiz(String title, int questionCount, int actualQuestions) {
		Category category = categoryRepo.save(Category.builder().categoryTitle(title + "-category").build());
		Quiz quiz = quizRepo.save(Quiz.builder().quizTitle(title).questionCount(questionCount).category(category).build());
		List<Long> questionIds = new ArrayList<>();
		for (int i = 0; i < actualQuestions; i++) {
			Question question = questionRepo
					.save(Question.builder().questionContent(title + "-content-" + i).answer("a").quiz(quiz).build());
			questionIds.add(question.getQuestionId());
		}
		return new QuizFixture(quiz, category, questionIds);
	}

	private void deleteQuiz(QuizFixture fixture) {
		quizRepo.deleteById(fixture.quiz().getQuizId());
		categoryRepo.deleteById(fixture.category().getCategoryId());
	}

	@Test
	void getQuestionsOfQuizForAdminLoadsQuestionsOutsideOfTestTransaction() {
		QuizFixture fixture = createQuiz("lazy-admin-quiz", 2, 3);
		try {
			List<Question> questions = questionService.getQuestionsOfQuizForAdmin(fixture.quiz().getQuizId());

			assertThat(questions).hasSize(3);
			assertThat(questions).allMatch(question -> "a".equals(question.getAnswer()));
		} finally {
			deleteQuiz(fixture);
		}
	}

	@Test
	void getQuestionsOfQuizLoadsQuestionsOutsideOfTestTransaction() {
		QuizFixture fixture = createQuiz("lazy-user-quiz", 2, 3);
		try {
			Set<Question> questions = questionService.getQuestionsOfQuiz(fixture.quiz().getQuizId());

			assertThat(questions).hasSize(2);
			assertThat(questions).allMatch(question -> "".equals(question.getAnswer()));
			assertThat(fixture.questionIds()).allSatisfy(questionId -> assertThat(
					questionRepo.findById(questionId).orElseThrow().getAnswer()).isEqualTo("a"));
		} finally {
			deleteQuiz(fixture);
		}
	}
}
