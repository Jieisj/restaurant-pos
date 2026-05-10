package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.dto.CreateOrderRequest;
import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.enums.OrderStatus;
import com.jie.restaurant_pos.enums.OrderType;
import com.jie.restaurant_pos.enums.TableStatus;
import com.jie.restaurant_pos.repository.OrderRepository;
import com.jie.restaurant_pos.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {
    private final RestaurantTableRepository repository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public List<RestaurantTable> getAllTables() {
        return repository.findAll();
    }

    public RestaurantTable getTableById(Long id) {
        return repository.findById(id).orElseThrow(()-> new RuntimeException("Table not found"));
    }

    public RestaurantTable addTable(RestaurantTable table) {
        return repository.save(table);
    }

    public RestaurantTable updateTable(Long id, Long userId, RestaurantTable updatedTable) {
        RestaurantTable table = repository.findById(id).orElseThrow(() -> new RuntimeException("Table not found"));
        if (table.getTableStatus().equals(TableStatus.AVAILABLE) && (updatedTable.getTableStatus().equals(TableStatus.RESERVED) || updatedTable.getTableStatus().equals(TableStatus.OCCUPIED))){
            orderService.createOrder(new CreateOrderRequest(table.getId(), userId, OrderType.DINING, null));
        }
        if (table.getTableStatus().equals(TableStatus.OCCUPIED) && (updatedTable.getTableStatus().equals(TableStatus.AVAILABLE) || updatedTable.getTableStatus().equals(TableStatus.RESERVED))){
            List<Order> activeOrders = orderRepository
                    .findByTableIdAndOrderStatusOrderByIdDesc(id, OrderStatus.SERVING);

            if (activeOrders.isEmpty()) {
                throw new RuntimeException("No active order for occupied table");
            }

            activeOrders.forEach(order -> {
                order.setTable(null);
                order.setUpdatedAt(LocalDateTime.now());
            });

            orderRepository.saveAll(activeOrders);
        }
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
