package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.service.RestaurantTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/table")
@CrossOrigin
@RequiredArgsConstructor
public class RestaurantTableController {
    private final RestaurantTableService service;

    @GetMapping
    public List<RestaurantTable> getAllTables() {
        return service.getAllTables();
    }

    @GetMapping("/{id}")
    public RestaurantTable getTableById(@PathVariable Long id) {
        return service.getTableById(id);
    }

    @PostMapping
    public RestaurantTable addTable(@RequestBody RestaurantTable table) {
        return service.addTable(table);
    }

    @PutMapping("/{id}")
    public RestaurantTable updateTable(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody RestaurantTable table
    ) {
        return service.updateTable(id, userId, table);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
         return service.deleteTable(id);
    }
}
