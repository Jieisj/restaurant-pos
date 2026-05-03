package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.MenuItemModifier;
import com.jie.restaurant_pos.enums.ModifierType;
import com.jie.restaurant_pos.repository.MenuItemModifierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemModifierService {
    private final MenuItemModifierRepository repository;

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

    public MenuItemModifier addModifier(MenuItemModifier modifier) {
        return repository.save(modifier);
    }

    public MenuItemModifier updateModifier(Long id, MenuItemModifier updatedModifier) {
        MenuItemModifier modifier = getModifierById(id);

        modifier.setMenuItem(updatedModifier.getMenuItem());
        modifier.setModifierType(updatedModifier.getModifierType());
        modifier.setName(updatedModifier.getName());
        modifier.setSwitchTo(updatedModifier.getSwitchTo());

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
