package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.MenuItem;
import com.jie.restaurant_pos.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menuItem")
@RequiredArgsConstructor
@CrossOrigin
public class MenuItemController {
    private final MenuItemService service;

    public List<MenuItem> getAllMenuItem(){
        return service.getAllMenuItem();
    }


    @GetMapping("/{id}")
    public MenuItem getMenuItemById(@PathVariable Long id) {
        return service.getMenuItemById(id);
    }

    @PostMapping
    public MenuItem addMenuItem(@RequestBody MenuItem menuItem) {
        return service.addMenuItem(menuItem);
    }

    @PutMapping("/{id}")
    public MenuItem updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItem menuItem
    ) {
        return service.updateMenuItem(id, menuItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        service.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

}
