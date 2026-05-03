package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.MenuItemModifier;
import com.jie.restaurant_pos.enums.ModifierType;
import com.jie.restaurant_pos.service.MenuItemModifierService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menuItemModifier")
@CrossOrigin
@RequiredArgsConstructor
public class MenuItemModifierController {
    private final MenuItemModifierService service;

    @GetMapping
    public List<MenuItemModifier> getAllModifiers() {
        return service.getAllModifiers();
    }

    @GetMapping("/{id}")
    public MenuItemModifier getModifierById(@PathVariable Long id) {
        return service.getModifierById(id);
    }

    @GetMapping("/menuItem/{menuItemId}")
    public List<MenuItemModifier> getModifiersByMenuItemId(@PathVariable Long menuItemId) {
        return service.getModifiersByMenuItemId(menuItemId);
    }

    @GetMapping("/menuItem/{menuItemId}/type/{modifierType}")
    public List<MenuItemModifier> getModifiersByMenuItemIdAndType(
            @PathVariable Long menuItemId,
            @PathVariable ModifierType modifierType
    ) {
        return service.getModifiersByMenuItemIdAndType(menuItemId, modifierType);
    }

    @PostMapping
    public MenuItemModifier addModifier(@RequestBody MenuItemModifier modifier) {
        return service.addModifier(modifier);
    }

    @PutMapping("/{id}")
    public MenuItemModifier updateModifier(
            @PathVariable Long id,
            @RequestBody MenuItemModifier modifier
    ) {
        return service.updateModifier(id, modifier);
    }

    @DeleteMapping("/{id}")
    public void deleteModifier(@PathVariable Long id) {
        service.deleteModifier(id);
    }

    @DeleteMapping("/menu-item/{menuItemId}")
    public void deleteModifiersByMenuItemId(@PathVariable Long menuItemId) {
        service.deleteModifiersByMenuItemId(menuItemId);
    }
}
