package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
