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

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MvcResult;

import com.exam.portal.entities.Category;
import com.exam.portal.entities.Question;
import com.exam.portal.entities.Quiz;
import com.exam.portal.repositories.CategoryRepo;
import com.exam.portal.repositories.QuestionRepo;
import com.exam.portal.repositories.QuizRepo;
import com.exam.portal.support.IntegrationTestSupport;
import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QuizControllerTests extends IntegrationTestSupport {

	@Autowired
	private CategoryRepo categoryRepo;

	@Autowired
	private QuizRepo quizRepo;

	@Autowired
	private QuestionRepo questionRepo;

	private Integer createCategory() {
		return categoryRepo.save(Category.builder().categoryTitle(unique("quiz-category"))
				.categoryDescription("description").build()).getCategoryId();
	}

	private Long createQuiz(Integer categoryId, String title, int questionCount) {
		return quizRepo.save(Quiz.builder().quizTitle(title).quizDescription("description").quizMaxMarks(10)
				.questionCount(questionCount).isActiveQuiz(true)
				.category(categoryRepo.findById(categoryId).orElseThrow()).build()).getQuizId();
	}

	private static String quizJson(String title, Integer categoryId, int questionCount) {
		return """
				{"quizTitle":"%s","quizDescription":"description","quizMaxMarks":10,"questionCount":%d,"isActiveQuiz":true,"category":{"categoryId":%d}}
				""".formatted(title, questionCount, categoryId);
	}

	private Question createQuestion(Quiz quiz, String content, String answer) {
		return questionRepo.save(Question.builder().questionContent(content).option1("a").option2("b")
				.option3("c").option4("d").answer(answer).quiz(quiz).build());
	}

	@Test
	void adminCanCreateQuiz() throws Exception {
		String title = unique("quiz");
		Integer categoryId = createCategory();

		mockMvc.perform(post("/quiz").header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
				.contentType(MediaType.APPLICATION_JSON).content(quizJson(title, categoryId, 2)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.quizId").isNumber())
				.andExpect(jsonPath("$.quizTitle").value(title))
				.andExpect(jsonPath("$.questionCount").value(2))
				.andExpect(jsonPath("$.category.categoryId").value(categoryId));
	}

	@Test
	void normalUserCannotCreateQuiz() throws Exception {
		mockMvc.perform(post("/quiz").header(HttpHeaders.AUTHORIZATION, bearer(userToken()))
				.contentType(MediaType.APPLICATION_JSON).content(quizJson(unique("quiz"), createCategory(), 2)))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));
	}

	@Test
	void getAllQuizzesReturnsExistingQuizzes() throws Exception {
		String title = unique("quiz");
		Integer categoryId = createCategory();
		createQuiz(categoryId, title, 1);

		mockMvc.perform(get("/quiz").header(HttpHeaders.AUTHORIZATION, bearer(userToken())))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString(title)));
	}

	@Test
	void getQuizByIdReturnsQuiz() throws Exception {
		String title = unique("quiz");
		Integer categoryId = createCategory();
		Long quizId = createQuiz(categoryId, title, 1);

		mockMvc.perform(get("/quiz/{quizId}", quizId).header(HttpHeaders.AUTHORIZATION, bearer(userToken())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.quizId").value(quizId))
				.andExpect(jsonPath("$.quizTitle").value(title));
	}

	@Test
	void adminCanUpdateQuiz() throws Exception {
		String title = unique("quiz");
		Integer categoryId = createCategory();
		Long quizId = createQuiz(categoryId, title, 1);

		mockMvc.perform(put("/quiz").header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
				.contentType(MediaType.APPLICATION_JSON).content("""
						{"quizId":%d,"quizTitle":"%s","quizDescription":"updated","quizMaxMarks":20,"questionCount":5,"isActiveQuiz":false}
						""".formatted(quizId, title + "-updated")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.quizId").value(quizId))
				.andExpect(jsonPath("$.quizTitle").value(title + "-updated"))
				.andExpect(jsonPath("$.questionCount").value(5))
				.andExpect(jsonPath("$.isActiveQuiz").value(false));
	}

	@Test
	void normalUserCannotUpdateQuiz() throws Exception {
		Long quizId = createQuiz(createCategory(), unique("quiz"), 1);

		mockMvc.perform(put("/quiz").header(HttpHeaders.AUTHORIZATION, bearer(userToken()))
				.contentType(MediaType.APPLICATION_JSON).content("""
						{"quizId":%d,"quizTitle":"hacked"}
						""".formatted(quizId)))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));
	}

	@Test
	void adminCanDeleteExistingQuiz() throws Exception {
		Long quizId = createQuiz(createCategory(), unique("quiz"), 1);

		mockMvc.perform(delete("/quiz/{quizId}", quizId).header(HttpHeaders.AUTHORIZATION, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(content().string("true"));

		assertThat(quizRepo.findById(quizId)).isEmpty();
	}

	@Test
	void adminDeletingMissingQuizReturnsFalse() throws Exception {
		mockMvc.perform(delete("/quiz/{quizId}", Long.MAX_VALUE)
				.header(HttpHeaders.AUTHORIZATION, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(content().string("false"));
	}

	@Test
	void normalUserCannotDeleteQuiz() throws Exception {
		Long quizId = createQuiz(createCategory(), unique("quiz"), 1);

		mockMvc.perform(delete("/quiz/{quizId}", quizId).header(HttpHeaders.AUTHORIZATION, bearer(userToken())))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));

		assertThat(quizRepo.findById(quizId)).isPresent();
	}

	@Test
	void evaluateQuizResultCountsAttemptedAndCorrectAnswers() throws Exception {
		Quiz quiz = quizRepo.findById(createQuiz(createCategory(), unique("quiz"), 4)).orElseThrow();
		Question correct = createQuestion(quiz, "q1", "a");
		Question wrong = createQuestion(quiz, "q2", "b");
		Question skipped = createQuestion(quiz, "q3", "c");
		Question blank = createQuestion(quiz, "q4", "d");

		String body = """
				[{"questionId":%d,"givenAnswer":"a"},{"questionId":%d,"givenAnswer":"nope"},{"questionId":%d},{"questionId":%d,"givenAnswer":""}]
				""".formatted(correct.getQuestionId(), wrong.getQuestionId(), skipped.getQuestionId(),
				blank.getQuestionId());

		MvcResult result = mockMvc
				.perform(post("/quiz/eval-quiz").header(HttpHeaders.AUTHORIZATION, bearer(userToken()))
						.contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalQuestionCount").value(4))
				.andExpect(jsonPath("$.attemptedQuestionCount").value(2))
				.andExpect(jsonPath("$.correctAnswerCount").value(1))
				.andReturn();

		Number score = JsonPath.read(result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.score");
		assertThat(score.doubleValue()).isEqualTo(25.0d);
	}
}
