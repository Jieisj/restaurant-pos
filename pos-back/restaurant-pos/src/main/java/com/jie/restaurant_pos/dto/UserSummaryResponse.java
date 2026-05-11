package com.jie.restaurant_pos.dto;

import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.enums.Role;
import lombok.Getter;

@Getter
public class UserSummaryResponse {
    private final Long id;
    private final String username;
    private final Role role;
    private final Long tableId;
    private final String tableLabel;
    private final Short tableSeat;

    public UserSummaryResponse(User user) {
        RestaurantTable table = user.getTable();

        this.id = user.getId();
        this.username = user.getUsername();
        this.role = user.getRole();
        this.tableId = table == null ? null : table.getId();
        this.tableLabel = table == null ? null : table.getLabel();
        this.tableSeat = table == null ? null : table.getSeat();
    }
}
