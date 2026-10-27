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

import com.exam.portal.repositories.CategoryRepo;
import com.exam.portal.support.IntegrationTestSupport;
import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CategoryControllerTests extends IntegrationTestSupport {

	@Autowired
	private CategoryRepo categoryRepo;

	private static String categoryJson(String title, String description) {
		return """
				{"categoryTitle":"%s","categoryDescription":"%s"}
				""".formatted(title, description);
	}

	private Integer createCategory(String token, String title) throws Exception {
		MvcResult result = mockMvc
				.perform(post("/category").header(HttpHeaders.AUTHORIZATION, bearer(token))
						.contentType(MediaType.APPLICATION_JSON).content(categoryJson(title, "description")))
				.andExpect(status().isOk()).andReturn();
		return JsonPath.read(result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.categoryId");
	}

	@Test
	void adminCanCreateCategory() throws Exception {
		String title = unique("category");

		mockMvc.perform(post("/category").header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
				.contentType(MediaType.APPLICATION_JSON).content(categoryJson(title, "some description")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.categoryId").isNumber())
				.andExpect(jsonPath("$.categoryTitle").value(title))
				.andExpect(jsonPath("$.categoryDescription").value("some description"));
	}

	@Test
	void normalUserCannotCreateCategory() throws Exception {
		mockMvc.perform(post("/category").header(HttpHeaders.AUTHORIZATION, bearer(userToken()))
				.contentType(MediaType.APPLICATION_JSON).content(categoryJson(unique("category"), "description")))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));
	}

	@Test
	void getAllCategoriesReturnsExistingCategories() throws Exception {
		String token = adminToken();
		String title = unique("category");
		createCategory(token, title);

		mockMvc.perform(get("/category").header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString(title)));
	}

	@Test
	void getCategoryByIdReturnsCategory() throws Exception {
		String token = adminToken();
		String title = unique("category");
		Integer id = createCategory(token, title);

		mockMvc.perform(get("/category/{categoryId}", id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.categoryId").value(id))
				.andExpect(jsonPath("$.categoryTitle").value(title));
	}

	@Test
	void adminCanUpdateCategory() throws Exception {
		String token = adminToken();
		String title = unique("category");
		Integer id = createCategory(token, title);

		mockMvc.perform(put("/category").header(HttpHeaders.AUTHORIZATION, bearer(token))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"categoryId":%d,"categoryTitle":"%s","categoryDescription":"updated"}
						""".formatted(id, title + "-updated")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.categoryId").value(id))
				.andExpect(jsonPath("$.categoryTitle").value(title + "-updated"))
				.andExpect(jsonPath("$.categoryDescription").value("updated"));
	}

	@Test
	void normalUserCannotUpdateCategory() throws Exception {
		String token = adminToken();
		Integer id = createCategory(token, unique("category"));

		mockMvc.perform(put("/category").header(HttpHeaders.AUTHORIZATION, bearer(userToken()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"categoryId":%d,"categoryTitle":"hacked","categoryDescription":"hacked"}
						""".formatted(id)))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));
	}

	@Test
	void adminCanDeleteExistingCategory() throws Exception {
		String token = adminToken();
		Integer id = createCategory(token, unique("category"));

		mockMvc.perform(delete("/category/{categoryId}", id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
				.andExpect(status().isOk())
				.andExpect(content().string("true"));

		assertThat(categoryRepo.findById(id)).isEmpty();
	}

	@Test
	void adminDeletingMissingCategoryReturnsFalse() throws Exception {
		mockMvc.perform(delete("/category/{categoryId}", Integer.MAX_VALUE)
				.header(HttpHeaders.AUTHORIZATION, bearer(adminToken())))
				.andExpect(status().isOk())
				.andExpect(content().string("false"));
	}

	@Test
	void normalUserCannotDeleteCategory() throws Exception {
		String token = adminToken();
		Integer id = createCategory(token, unique("category"));

		mockMvc.perform(delete("/category/{categoryId}", id).header(HttpHeaders.AUTHORIZATION, bearer(userToken())))
				.andExpect(status().is(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS.value()));

		assertThat(categoryRepo.findById(id)).isPresent();
	}
}
