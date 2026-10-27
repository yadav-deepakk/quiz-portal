package com.exam.portal.entities;

import java.util.LinkedHashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer categoryId;

	@Column(nullable = false, length = 1000)
	private String categoryTitle;

	@Column(length = 2500)
	private String categoryDescription;

	@OneToMany(cascade = CascadeType.ALL, mappedBy = "category")
	@JsonIgnore
	@Builder.Default
	private Set<Quiz> quizSet = new LinkedHashSet<>();
}
