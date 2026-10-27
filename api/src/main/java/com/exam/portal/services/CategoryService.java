package com.exam.portal.services;

import java.util.Optional;
import java.util.Set;

import com.exam.portal.entities.Category;

public interface CategoryService {
	public Category addCategory(Category category);

	public Optional<Category> getCategoryById(Integer categoryId);

	public Set<Category> getAllCategories();

	public Category updateCategory(Category category);

	public boolean deleteCategoryById(Integer categoryId);

}
