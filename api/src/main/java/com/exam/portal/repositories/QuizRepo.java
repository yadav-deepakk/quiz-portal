package com.exam.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.exam.portal.entities.Quiz;

public interface QuizRepo extends JpaRepository<Quiz, Long> {
}
