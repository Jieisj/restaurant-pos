package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.Category;
import com.jie.restaurant_pos.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@CrossOrigin
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;

    @GetMapping
    public List<Category> getAllCategories(){
        return service.getAllCategories();
    }

    @PostMapping
    public ResponseEntity<Category>  createCategory(@RequestBody Category category){
        return ResponseEntity.ok(service.createCategory(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id){
        service.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public Category getCategory(@PathVariable Long id) {
        return service.getCategoryById(id);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category) {

        Category updated = service.updateCategory(id, category);
        return ResponseEntity.ok(updated);
    }
}
