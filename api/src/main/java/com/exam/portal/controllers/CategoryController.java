package com.exam.portal.controllers;

import java.security.Principal;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.exam.portal.entities.Category;
import com.exam.portal.services.CategoryService;
import com.exam.portal.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/category")
@CrossOrigin(origins = "http://localhost:4200", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
		RequestMethod.DELETE })
public class CategoryController {

	@Autowired
	private CategoryService categoryService;

	@Autowired
	private UserService userService;

	private Logger log = LoggerFactory.getLogger(CategoryController.class);

	@PostMapping
	public ResponseEntity<Category> addCategory(@Valid @RequestBody Category category, Principal principal) {
		if (!userService.hasAdminRole(principal)) {
			return new ResponseEntity<>(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS);
		}
		log.info("POST: /category {}", category);
		return ResponseEntity.ok(categoryService.addCategory(category));
	}

	@GetMapping
	public ResponseEntity<Set<Category>> getAllCategories() {
		log.info("GET: /category");
		return ResponseEntity.ok(categoryService.getAllCategories());
	}

	@GetMapping("/{categoryId}")
	public ResponseEntity<Category> getCategoryByCategoryId(@PathVariable Integer categoryId) {
		log.info("GET: /category/{}", categoryId);
		return ResponseEntity.ok(categoryService.getCategoryById(categoryId).get());
	}

	@PutMapping
	public ResponseEntity<Category> updateCategory(@Valid @RequestBody Category category, Principal principal) {
		if (!userService.hasAdminRole(principal)) {
			return new ResponseEntity<>(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS);
		}
		log.info("PUT: /category/ {}", category);
		return ResponseEntity.ok(categoryService.updateCategory(category));
	}

	@DeleteMapping("/{categoryId}")
	public ResponseEntity<Boolean> deleteCategoryById(@PathVariable Integer categoryId, Principal principal) {
		if (!userService.hasAdminRole(principal)) {
			return new ResponseEntity<>(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS);
		}
		log.info("Delete: /category/{}", categoryId);
		return ResponseEntity.ok(categoryService.deleteCategoryById(categoryId));
	}
}
