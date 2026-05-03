package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.Category;
import com.jie.restaurant_pos.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository repository;

    public List<Category> getAllCategories(){
        return this.repository.findAll();
    }

    public Category createCategory(Category category) {
        return repository.save(category);
    }

    public void deleteCategory(Long id){
        repository.deleteById(id);
    }

    public Category getCategoryById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category updateCategory(Long id, Category updatedCategory) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(updatedCategory.getName());

        return repository.save(category);
    }
}
