package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.dto.MenuItemModifierRequest;
import com.jie.restaurant_pos.entity.MenuItem;
import com.jie.restaurant_pos.entity.MenuItemModifier;
import com.jie.restaurant_pos.enums.ModifierType;
import com.jie.restaurant_pos.repository.MenuItemModifierRepository;
import com.jie.restaurant_pos.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemModifierService {
    private final MenuItemModifierRepository repository;
    private final MenuItemRepository menuItemRepository;

    public List<MenuItemModifier> getAllModifiers() {
        return repository.findAll();
    }

    public MenuItemModifier getModifierById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modifier not found"));
    }

    public List<MenuItemModifier> getModifiersByMenuItemId(Long menuItemId) {
        return repository.findByMenuItemId(menuItemId);
    }

    public List<MenuItemModifier> getModifiersByMenuItemIdAndType(
            Long menuItemId,
            ModifierType modifierType
    ) {
        return repository.findByMenuItemIdAndModifierType(menuItemId, modifierType);
    }

    public MenuItemModifier addModifier(MenuItemModifierRequest request) {
        MenuItemModifier modifier = new MenuItemModifier();
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId()).orElseThrow(() -> new RuntimeException("Menu Item not found"));
        modifier.setMenuItem(menuItem);
        modifier.setModifierType(request.getModifierType());
        modifier.setSwitchTo(request.getSwitchTo());
        modifier.setName(request.getName());
        return repository.save(modifier);
    }

    public MenuItemModifier updateModifier(Long id, MenuItemModifierRequest request) {
        MenuItemModifier modifier = getModifierById(id);

        modifier.setMenuItem(modifier.getMenuItem());
        modifier.setModifierType(request.getModifierType());
        modifier.setName(request.getName());
        modifier.setSwitchTo(request.getSwitchTo());

        return repository.save(modifier);
    }

    public void deleteModifier(Long id) {
        repository.deleteById(id);
    }

    public void deleteModifiersByMenuItemId(Long menuItemId) {
        List<MenuItemModifier> modifiers = repository.findByMenuItemId(menuItemId);
        repository.deleteAll(modifiers);
    }
}
