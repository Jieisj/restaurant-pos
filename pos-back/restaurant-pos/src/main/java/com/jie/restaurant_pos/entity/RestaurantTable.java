package com.jie.restaurant_pos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jie.restaurant_pos.enums.TableStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "res_tables")
@Setter
@Getter
public class RestaurantTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private  String label;

    private  Short seat;

    @Enumerated(EnumType.STRING)
    private TableStatus tableStatus;

    private Short posX;

    private Short posY;

    @OneToMany(mappedBy = "table")
    @JsonIgnore
    private List<Order> orders;
}
