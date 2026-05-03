package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.MenuItem;
import com.jie.restaurant_pos.entity.MenuItemModifier;
import com.jie.restaurant_pos.enums.ModifierType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemModifierRepository extends JpaRepository<MenuItemModifier, Long> {
    List<MenuItemModifier> findByMenuItemIdAndModifierType(Long id, ModifierType modifierType);
    List<MenuItemModifier> findByMenuItemId(Long id);
}
