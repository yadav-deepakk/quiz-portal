package com.exam.portal.services.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.exam.portal.entities.Category;
import com.exam.portal.entities.Question;
import com.exam.portal.entities.Quiz;
import com.exam.portal.models.QuizResult;
import com.exam.portal.repositories.CategoryRepo;
import com.exam.portal.repositories.QuestionRepo;
import com.exam.portal.repositories.QuizRepo;
import com.exam.portal.services.QuestionService;

import jakarta.persistence.EntityManager;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class QuestionServiceTests {

	@Autowired
	private QuestionService questionService;

	@Autowired
	private CategoryRepo categoryRepo;

	@Autowired
	private QuizRepo quizRepo;

	@Autowired
	private QuestionRepo questionRepo;

	@Autowired
	private EntityManager entityManager;

	private record QuizFixture(Quiz quiz, List<Question> questions) {
	}

	private QuizFixture createQuiz(int questionCount, int actualQuestions) {
		Category category = categoryRepo.save(Category.builder().categoryTitle("service-category").build());
		Quiz quiz = quizRepo.save(Quiz.builder().quizTitle("service-quiz").questionCount(questionCount)
				.category(category).build());
		List<Question> questions = new ArrayList<>();
		for (int i = 0; i < actualQuestions; i++) {
			questions.add(questionRepo.save(Question.builder().questionContent("content-" + i).answer("a")
					.quiz(quiz).build()));
		}
		entityManager.flush();
		entityManager.clear();
		return new QuizFixture(quiz, questions);
	}

	@Test
	void addAndReadQuestions() {
		Question question = questionRepo.save(Question.builder().questionContent("stored").answer("a").build());

		assertThat(questionService.getQuestionById(question.getQuestionId())).isPresent();
		assertThat(questionService.getQuestionById(Long.MAX_VALUE)).isEmpty();
		assertThat(questionService.getAllQuestions()).extracting(Question::getQuestionId)
				.contains(question.getQuestionId());
	}

	@Test
	void updateQuestionPersistsChanges() {
		Question question = questionRepo.save(Question.builder().questionContent("before").answer("a").build());
		question.setQuestionContent("after");

		Question updated = questionService.updateQuestion(question);

		assertThat(updated.getQuestionContent()).isEqualTo("after");
		assertThat(questionRepo.findById(question.getQuestionId()).orElseThrow().getQuestionContent())
				.isEqualTo("after");
	}

	@Test
	void deleteQuestionReturnsFalseForMissingQuestion() {
		assertThat(questionService.deleteQuestionById(Long.MAX_VALUE)).isFalse();
	}

	@Test
	void deleteQuestionRemovesExistingQuestion() {
		Question question = questionRepo.save(Question.builder().questionContent("to-delete").answer("a").build());

		assertThat(questionService.deleteQuestionById(question.getQuestionId())).isTrue();
		assertThat(questionRepo.findById(question.getQuestionId())).isEmpty();
	}

	@Test
	void getQuestionsOfQuizForAdminKeepsAnswers() {
		QuizFixture fixture = createQuiz(2, 3);

		List<Question> questions = questionService.getQuestionsOfQuizForAdmin(fixture.quiz().getQuizId());

		assertThat(questions).hasSize(3);
		assertThat(questions).allMatch(question -> "a".equals(question.getAnswer()));
	}

	@Test
	void getQuestionsOfQuizHidesAnswersAndTrimsToConfiguredCount() {
		QuizFixture fixture = createQuiz(2, 3);

		Set<Question> questions = questionService.getQuestionsOfQuiz(fixture.quiz().getQuizId());

		assertThat(questions).hasSize(2);
		assertThat(questions).allMatch(question -> "".equals(question.getAnswer()));
	}

	@Test
	void getQuestionsOfQuizReturnsAllQuestionsWhenCountMatches() {
		QuizFixture fixture = createQuiz(2, 2);

		Set<Question> questions = questionService.getQuestionsOfQuiz(fixture.quiz().getQuizId());

		assertThat(questions).hasSize(2);
	}

	@Test
	void getQuestionsOfQuizReturnsNullWhenQuizHasTooFewQuestions() {
		QuizFixture fixture = createQuiz(5, 1);

		assertThat(questionService.getQuestionsOfQuiz(fixture.quiz().getQuizId())).isNull();
	}

	@Test
	void evaluateQuizResultHandlesCorrectWrongSkippedAndBlankAnswers() {
		QuizFixture fixture = createQuiz(4, 3);
		Long first = fixture.questions().get(0).getQuestionId();
		Long second = fixture.questions().get(1).getQuestionId();
		Long third = fixture.questions().get(2).getQuestionId();

		List<Question> submission = List.of(clientQuestion(first, "a"), clientQuestion(second, "wrong"),
				clientQuestion(third, null), clientQuestion(first, ""));

		QuizResult result = questionService.evaluateQuizResult(submission);

		assertThat(result.getTotalQuestionCount()).isEqualTo(4);
		assertThat(result.getAttemptedQuestionCount()).isEqualTo(2);
		assertThat(result.getCorrectAnswerCount()).isEqualTo(1);
		assertThat(result.getScore()).isEqualTo(25.0f);
	}

	@Test
	void evaluateQuizResultHandlesEmptySubmission() {
		QuizResult result = questionService.evaluateQuizResult(List.of());

		assertThat(result.getTotalQuestionCount()).isZero();
		assertThat(result.getAttemptedQuestionCount()).isZero();
		assertThat(result.getCorrectAnswerCount()).isZero();
		assertThat(result.getScore()).isNaN();
	}

	private static Question clientQuestion(Long questionId, String givenAnswer) {
		return Question.builder().questionId(questionId).givenAnswer(givenAnswer).build();
	}
}
