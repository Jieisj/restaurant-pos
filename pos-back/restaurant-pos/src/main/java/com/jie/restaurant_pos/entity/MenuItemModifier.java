package com.jie.restaurant_pos.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jie.restaurant_pos.enums.ModifierType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "menu_item_modifiers")
@Setter
@Getter
public class MenuItemModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "menu_item_id")
    @JsonIgnore
    private MenuItem menuItem;

    @Enumerated(EnumType.STRING)
    private ModifierType modifierType;

    private String name;

    private String switchTo;
}
