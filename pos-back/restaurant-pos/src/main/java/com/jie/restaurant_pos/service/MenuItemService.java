package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.MenuItem;
import com.jie.restaurant_pos.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MenuItemService {
    private final MenuItemRepository repository;

    public List<MenuItem> getAllMenuItem() {
        return repository.findAll();
    }

    public MenuItem getMenuItemById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Menu item not found"));
    }

    public MenuItem addMenuItem(MenuItem menuItem) {
         return repository.save(menuItem);
    }

    public MenuItem updateMenuItem(Long id, MenuItem updatedMenuItem) {
        MenuItem menuItem = repository.findById(id).orElseThrow(() -> new RuntimeException("Menu item not found"));
        menuItem.setUpdatedAt(LocalDateTime.now());
        menuItem.setPrice(updatedMenuItem.getPrice());
        menuItem.setName(updatedMenuItem.getName());
        menuItem.setIsAvailable(updatedMenuItem.getIsAvailable());
        menuItem.setCategories(menuItem.getCategories());
        return repository.save(menuItem);
    }

    public void deleteMenuItem(Long id) {
        repository.deleteById(id);
    }
}
