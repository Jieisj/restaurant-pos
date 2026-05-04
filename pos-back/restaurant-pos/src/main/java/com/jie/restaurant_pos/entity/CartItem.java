package com.jie.restaurant_pos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false, insertable = false, updatable = false)
    @JsonIgnore
    private Order order;

    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false, insertable = false, updatable = false)
    @JsonIgnore
    private MenuItem menuItem;

    @Column(name = "menu_item_id")
    private Long menuItemId;

    @Column(name = "name_snapshot", nullable = false, length = 25)
    @JsonProperty("name")
    private String nameSnapshot;

    @Column(name = "price_snapshot", nullable = false, precision = 10, scale = 2)
    @JsonProperty("price")
    private BigDecimal priceSnapshot;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "is_pending", nullable = false)
    private Byte isPending = 1;

    @Column(name = "is_finished", nullable = false)
    private Byte isFinished = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}