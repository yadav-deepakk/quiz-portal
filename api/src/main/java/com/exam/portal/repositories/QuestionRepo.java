package com.exam.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.exam.portal.entities.Question;

public interface QuestionRepo extends JpaRepository<Question, Long> {
}
