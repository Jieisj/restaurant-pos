package com.jie.restaurant_pos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Setter
@Getter
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "order_id")
    private Order order;

    private Long menuItemId;

    private String nameSnapshot;

    private BigDecimal priceSnapshot;

    private Integer quantity;

    private Byte isPending;

    private Byte isFinished;

    private LocalDateTime sentAt;

    private LocalDateTime createdAt;

    private LocalDateTime finishedAt;

}
