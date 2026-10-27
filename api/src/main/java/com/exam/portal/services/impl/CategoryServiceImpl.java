package com.exam.portal.services.impl;

import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.portal.entities.Category;
import com.exam.portal.repositories.CategoryRepo;
import com.exam.portal.services.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {

	@Autowired
	private CategoryRepo categoryRepo;

	@Override
	public Category addCategory(Category category) {
		return categoryRepo.save(category);
	}

	@Override
	public Optional<Category> getCategoryById(Integer categoryId) {
		return categoryRepo.findById(categoryId);
	}

	@Override
	public Set<Category> getAllCategories() {
		return new LinkedHashSet<>(categoryRepo.findAll());
	}

	@Override
	public Category updateCategory(Category category) {
		return this.addCategory(category);
	}

	@Override
	public boolean deleteCategoryById(Integer categoryId) {
		Optional<Category> cat = categoryRepo.findById(categoryId);
		if (cat.isEmpty())
			return false;

		categoryRepo.delete(cat.get());
		return true;
	}

}
