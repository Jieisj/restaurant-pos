package com.jie.restaurant_pos.dto;

import com.jie.restaurant_pos.enums.ModifierType;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MenuItemModifierRequest {
    private Long menuItemId;
    private ModifierType modifierType;
    private String name;
    private String switchTo;
}
