package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {
    private final RestaurantTableRepository repository;

    public List<RestaurantTable> getAllTables() {
        return repository.findAll();
    }

    public RestaurantTable getTableById(Long id) {
        return repository.findById(id).orElseThrow(()-> new RuntimeException("Table not found"));
    }

    public RestaurantTable addTable(RestaurantTable table) {
        return repository.save(table);
    }

    public RestaurantTable updateTable(Long id, RestaurantTable updatedTable) {
        RestaurantTable table = repository.findById(id).orElseThrow(() -> new RuntimeException("Table not found"));
        table.setTableStatus(updatedTable.getTableStatus());
        table.setLabel(updatedTable.getLabel());
        table.setSeat(updatedTable.getSeat());
        table.setPosX(updatedTable.getPosX());
        table.setPosY(updatedTable.getPosY());
        return repository.save(table);
    }

    public ResponseEntity<Void> deleteTable(Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
