package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
}
