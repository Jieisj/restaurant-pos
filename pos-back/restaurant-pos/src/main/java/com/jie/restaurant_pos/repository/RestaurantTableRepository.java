package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
}
