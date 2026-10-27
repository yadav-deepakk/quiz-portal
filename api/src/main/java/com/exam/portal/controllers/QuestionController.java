package com.exam.portal.controllers;

import java.security.Principal;
import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.exam.portal.entities.Question;
import com.exam.portal.entities.Quiz;
import com.exam.portal.repositories.QuestionRepo;
import com.exam.portal.services.QuestionService;
import com.exam.portal.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/question")
@CrossOrigin(origins = "http://localhost:4200", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
		RequestMethod.DELETE })
public class QuestionController {

	@Autowired
	private QuestionService quesService;

	@Autowired
	private UserService userService;

	private Logger log = LoggerFactory.getLogger(QuestionController.class);

	@PostMapping
	public ResponseEntity<Question> addQuestion(@Valid @RequestBody Question question, Principal principal) {
		log.info("POST: /question/ {}", question);
		if (!userService.hasAdminRole(principal)) {
			return new ResponseEntity<>(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS);
		}
		return ResponseEntity.ok(quesService.addQuestion(question));
	}

	@GetMapping
	public ResponseEntity<Set<Question>> getAllQuestions() {
		log.info("GET: /question/");
		return ResponseEntity.ok(quesService.getAllQuestions());
	}

	@GetMapping("/{questionId}")
	public ResponseEntity<Question> getQuestionById(@PathVariable Long questionId) {
		log.info("GET: /question/{}", questionId);
		return ResponseEntity.ok(quesService.getQuestionById(questionId).get());
	}

	@GetMapping("/quiz/all/{quizId}")
	public ResponseEntity<List<Question>> getQuestionOfQuizForAdmin(@PathVariable Long quizId, Principal principal) {
		log.info("GET: /question/quiz/all/{}", quizId);
		if (!userService.hasAdminRole(principal)) {
			return new ResponseEntity<>(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS);
		}
		return ResponseEntity.ok(quesService.getQuestionsOfQuizForAdmin(quizId));
	}

	@GetMapping("/quiz/{quizId}")
	public ResponseEntity<Set<Question>> getQuestionOfQuiz(@PathVariable Long quizId) {
		log.info("GET: /question/quiz/{}", quizId);
		return ResponseEntity.ok(quesService.getQuestionsOfQuiz(quizId));
	}

	@PutMapping
	public ResponseEntity<Question> updateQuestion(@Valid @RequestBody Question question, Principal principal) {
		log.info("PUT: /question/ {}", question);
		if (!userService.hasAdminRole(principal)) {
			return new ResponseEntity<>(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS);
		}
		return ResponseEntity.ok(quesService.updateQuestion(question));
	}

	@DeleteMapping("/{questionId}")
	public ResponseEntity<Boolean> deleteQuestionById(@PathVariable Long questionId, Principal principal) {
		log.info("PUT: /question/ {}", questionId);
		if (!userService.hasAdminRole(principal)) {
			return new ResponseEntity<>(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS);
		}
		return ResponseEntity.ok(quesService.deleteQuestionById(questionId));
	}
}
