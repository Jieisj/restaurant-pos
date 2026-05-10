package com.jie.restaurant_pos.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "customer")
@Setter
@Getter
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 80)
    private String name;

    @Column(length = 255)
    private String address;

    @Column(length = 25)
    private String phoneNumber;

    @Column(length = 255)
    private String note;
}
