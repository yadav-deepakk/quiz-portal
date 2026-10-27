package com.exam.portal.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.exam.portal.entities.Category;
import com.exam.portal.entities.Question;
import com.exam.portal.entities.Quiz;
import com.exam.portal.repositories.CategoryRepo;
import com.exam.portal.repositories.QuestionRepo;
import com.exam.portal.repositories.QuizRepo;
import com.exam.portal.support.IntegrationTestSupport;
import com.jayway.jsonpath.JsonPath;

import jakarta.persistence.EntityManager;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class QuestionControllerTests extends IntegrationTestSupport {

	private static final String JWT = HttpHeaders.AUTHORIZATION;

	@Autowired
	private CategoryRepo categoryRepo;

	@Autowired
	private QuizRepo quizRepo;

	@Autowired
	private QuestionRepo questionRepo;

	@Autowired
	private EntityManager entityManager;

	private record QuizFixture(Long quizId, List<Long> questionIds, List<String> questionContents) {
	}

	/**
	 * Creates a quiz with {@code actualQuestions} questions. The persistence
	 * context is flushed and cleared afterwards so that the quiz re-loaded by the
	 * production code obtains its (lazy) question collection from the database.
	 */
	private QuizFixture createQuiz(String title, int questionCount, int actualQuestions) {
		Category category = categoryRepo
				.save(Category.builder().categoryTitle(unique("question-category")).build());
		Quiz quiz = quizRepo.save(Quiz.builder().quizTitle(title).quizDescription("description").quizMaxMarks(10)
				.questionCount(questionCount).category(category).build());

		List<Long> ids = new ArrayList<>();
		List<String> contents = new ArrayList<>();
		for (int i = 0; i < actualQuestions; i++) {
			String content = unique("content");
			Question question = questionRepo.save(Question.builder().questionContent(content).option1("a").option2("b")
					.option3("c").option4("d").answer("a").quiz(quiz).build());
			ids.add(question.getQuestionId());
			contents.add(content);
		}
		entityManager.flush();
		entityManager.clear();
		return new QuizFixture(quiz.getQuizId(), ids, contents);
	}

	private static String questionJson(String content, Long quizId) {
		return """
				{"questionContent":"%s","option1":"a","option2":"b","option3":"c","option4":"d","answer":"a","quiz":{"quizId":%d}}
				""".formatted(content, quizId);
	}

	@Test
	void adminCanCreateQuestion() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 1, 0);
		String content = unique("content");

		mockMvc.perform(post("/question").header(JWT, bearer(adminToken()))
				.contentType(MediaType.APPLICATION_JSON).content(questionJson(content, quiz.quizId())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.questionId").isNumber())
				.andExpect(jsonPath("$.questionContent").value(content))
				.andExpect(jsonPath("$.quiz.quizId").value(quiz.quizId()));
	}

	@Test
	void normalUserCannotCreateQuestion() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 1, 0);

		mockMvc.perform(post("/question").header(JWT, bearer(userToken()))
				.contentType(MediaType.APPLICATION_JSON).content(questionJson(unique("content"), quiz.quizId())))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));
	}

	@Test
	void getAllQuestionsReturnsStoredQuestions() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 1, 1);

		mockMvc.perform(get("/question").header(JWT, bearer(userToken())))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString(quiz.questionContents().get(0))));
	}

	@Test
	void getQuestionByIdReturnsQuestion() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 1, 1);
		Long questionId = quiz.questionIds().get(0);

		mockMvc.perform(get("/question/{questionId}", questionId).header(JWT, bearer(userToken())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.questionId").value(questionId))
				.andExpect(jsonPath("$.questionContent").value(quiz.questionContents().get(0)));
	}

	@Test
	void adminCanFetchAllQuestionsOfAQuiz() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 2, 3);

		mockMvc.perform(get("/question/quiz/all/{quizId}", quiz.quizId()).header(JWT, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(3))
				.andExpect(jsonPath("$[0].answer").value("a"));
	}

	@Test
	void normalUserCannotFetchAllQuestionsOfAQuiz() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 2, 3);

		mockMvc.perform(get("/question/quiz/all/{quizId}", quiz.quizId()).header(JWT, bearer(userToken())))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));
	}

	@Test
	void getQuestionsOfQuizHidesAnswersAndTrimsToQuestionCount() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 2, 3);

		MvcResult result = mockMvc
				.perform(get("/question/quiz/{quizId}", quiz.quizId()).header(JWT, bearer(userToken())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andReturn();

		List<String> answers = JsonPath.read(result.getResponse().getContentAsString(StandardCharsets.UTF_8),
				"$[*].answer");
		assertThat(answers).hasSize(2).allMatch(String::isEmpty);
	}

	@Test
	void getQuestionsOfQuizWorksWhenQuestionCountMatches() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 2, 2);

		mockMvc.perform(get("/question/quiz/{quizId}", quiz.quizId()).header(JWT, bearer(userToken())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2));
	}

	@Test
	void getQuestionsOfQuizReturnsEmptyWhenQuizHasInsufficientQuestions() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 5, 1);

		mockMvc.perform(get("/question/quiz/{quizId}", quiz.quizId()).header(JWT, bearer(userToken())))
				.andExpect(status().isOk())
				.andExpect(content().string(""));
	}

	@Test
	void adminCanUpdateQuestion() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 1, 1);
		Long questionId = quiz.questionIds().get(0);
		String updated = unique("updated-content");

		mockMvc.perform(put("/question").header(JWT, bearer(adminToken()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"questionId":%d,"questionContent":"%s","option1":"a","option2":"b","option3":"c","option4":"d","answer":"b"}
						""".formatted(questionId, updated)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.questionId").value(questionId))
				.andExpect(jsonPath("$.questionContent").value(updated))
				.andExpect(jsonPath("$.answer").value("b"));
	}

	@Test
	void normalUserCannotUpdateQuestion() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 1, 1);

		mockMvc.perform(put("/question").header(JWT, bearer(userToken()))
				.contentType(MediaType.APPLICATION_JSON).content("""
						{"questionId":%d,"questionContent":"hacked"}
						""".formatted(quiz.questionIds().get(0))))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));
	}

	@Test
	void adminCanDeleteExistingQuestion() throws Exception {
		Question question = questionRepo.save(Question.builder().questionContent(unique("content")).answer("a").build());

		mockMvc.perform(delete("/question/{questionId}", question.getQuestionId()).header(JWT, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(content().string("true"));

		assertThat(questionRepo.findById(question.getQuestionId())).isEmpty();
	}

	@Test
	void adminDeletingMissingQuestionReturnsFalse() throws Exception {
		mockMvc.perform(delete("/question/{questionId}", Long.MAX_VALUE).header(JWT, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(content().string("false"));
	}

	@Test
	void normalUserCannotDeleteQuestion() throws Exception {
		QuizFixture quiz = createQuiz(unique("quiz"), 1, 1);

		mockMvc.perform(delete("/question/{questionId}", quiz.questionIds().get(0)).header(JWT, bearer(userToken())))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));

		assertThat(questionRepo.findById(quiz.questionIds().get(0))).isPresent();
	}
}
