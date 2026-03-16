import { useMemo, useState } from "react";
import { ROLES } from "../../../constants/roles";
import MenuGrid from "../components/MenuGrid";
import MenuItemForm from "../components/MenuItemForm";
import CategoryManager from "../components/CategoryManager";

const initialCategories = [
  { id: 1, name: "Burgers" },
  { id: 2, name: "Drinks" },
  { id: 3, name: "Desserts" },
];

const initialItems = [
  {
    id: 1,
    name: "Cheese Burger",
    price: 9.99,
    categoryId: 1,
    isAvailable: true,
    modifiers: {
      addOptions: ["Cheese", "Bacon"],
      noOptions: ["Onion", "Pickles"],
      switchOptions: ["Salad"],
    },
  },
  {
    id: 2,
    name: "Chicken Burger",
    price: 10.99,
    categoryId: 1,
    isAvailable: true,
    modifiers: {
      addOptions: ["Egg"],
      noOptions: ["Tomato"],
      switchOptions: ["Coleslaw"],
    },
  },
  {
    id: 3,
    name: "Coca Cola",
    price: 2.5,
    categoryId: 2,
    isAvailable: true,
    modifiers: {
      addOptions: ["Ice"],
      noOptions: ["Sugar"],
      switchOptions: ["Large Size"],
    },
  },
  {
    id: 4,
    name: "Chocolate Cake",
    price: 4.75,
    categoryId: 3,
    isAvailable: false,
    modifiers: {
      addOptions: ["Ice Cream"],
      noOptions: ["Chocolate Syrup"],
      switchOptions: ["Vanilla Cake"],
    },
  },
];

const createEmptyForm = () => ({
  name: "",
  price: "",
  categoryId: "",
  isAvailable: true,
  modifiers: {
    addOptions: [],
    noOptions: [],
    switchOptions: [],
  },
});

function MenuPage({ role, selectedTableId }) {
  const isAdmin = role === ROLES.ADMIN;
  const isCustomer = role === ROLES.CUSTOMER;

  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(createEmptyForm());

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === "all") {
      return items;
    }

    return items.filter((item) => item.categoryId === selectedCategoryId);
  }, [items, selectedCategoryId]);

  const getCategoryName = (categoryId) => {
    return categories.find((category) => category.id === categoryId)?.name || "Unknown";
  };

  const openAddForm = () => {
    setEditingItem(null);
    setFormData(createEmptyForm());
    setShowItemForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
      modifiers: {
        addOptions: item.modifiers?.addOptions || [],
        noOptions: item.modifiers?.noOptions || [],
        switchOptions: item.modifiers?.switchOptions || [],
      },
    });
    setShowItemForm(true);
  };

  const closeItemForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setFormData(createEmptyForm());
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "categoryId"
          ? Number(value) || ""
          : value,
    }));
  };

  const handleAddModifierOption = (key, value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setFormData((prev) => {
      const exists = prev.modifiers[key].some(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
      );

      if (exists) return prev;

      return {
        ...prev,
        modifiers: {
          ...prev.modifiers,
          [key]: [...prev.modifiers[key], trimmed],
        },
      };
    });
  };

  const handleDeleteModifierOption = (key, valueToDelete) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: {
        ...prev.modifiers,
        [key]: prev.modifiers[key].filter((value) => value !== valueToDelete),
      },
    }));
  };

  const handleSubmitItem = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return;
    if (formData.price === "" || Number(formData.price) < 0) return;
    if (!formData.categoryId) return;

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      categoryId: Number(formData.categoryId),
      isAvailable: formData.isAvailable,
      modifiers: {
        addOptions: formData.modifiers.addOptions,
        noOptions: formData.modifiers.noOptions,
        switchOptions: formData.modifiers.switchOptions,
      },
    };

    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...payload,
              }
            : item
        )
      );
    } else {
      const newItem = {
        id: Date.now(),
        ...payload,
      };

      setItems((prev) => [...prev, newItem]);
    }

    closeItemForm();
  };

  const handleDeleteItem = (item) => {
    const confirmed = window.confirm(`Delete "${item.name}"?`);
    if (!confirmed) return;

    setItems((prev) => prev.filter((menuItem) => menuItem.id !== item.id));
  };

  const handleAddCategory = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const exists = categories.some(
      (category) => category.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      alert("Category already exists.");
      return;
    }

    const newCategory = {
      id: Date.now(),
      name: trimmed,
    };

    setCategories((prev) => [...prev, newCategory]);
  };

  const handleDeleteCategory = (categoryId) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) return;

    const hasItems = items.some((item) => item.categoryId === categoryId);

    const confirmed = window.confirm(
      hasItems
        ? `Delete "${category.name}" and all menu items inside it?`
        : `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    setCategories((prev) => prev.filter((category) => category.id !== categoryId));
    setItems((prev) => prev.filter((item) => item.categoryId !== categoryId));

    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId("all");
    }
  };

  const handleAddToCart = (item) => {
    alert(
      selectedTableId
        ? `Add "${item.name}" to Table ${selectedTableId}`
        : `Add "${item.name}" to cart`
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Menu</h1>
          <p style={styles.subtitle}>
            {isAdmin
              ? "Manage food items, categories, and modifiers."
              : isCustomer
              ? "Browse the menu and review items before adding to cart."
              : "Browse menu items."}
          </p>
        </div>

        {isAdmin && (
          <div style={styles.headerActions}>
            <button style={styles.primaryButton} onClick={openAddForm}>
              Add Item
            </button>
            <button
              style={styles.secondaryButton}
              onClick={() => setShowCategoryManager(true)}
            >
              Manage Categories
            </button>
          </div>
        )}
      </div>

      <div style={styles.categoryBar}>
        <button
          style={{
            ...styles.categoryButton,
            ...(selectedCategoryId === "all" ? styles.categoryButtonActive : {}),
          }}
          onClick={() => setSelectedCategoryId("all")}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            style={{
              ...styles.categoryButton,
              ...(selectedCategoryId === category.id
                ? styles.categoryButtonActive
                : {}),
            }}
            onClick={() => setSelectedCategoryId(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <MenuGrid
        items={filteredItems}
        isAdmin={isAdmin}
        getCategoryName={getCategoryName}
        onEditItem={openEditForm}
        onDeleteItem={handleDeleteItem}
        onAddToOrder={handleAddToCart}
      />

      {isAdmin && showItemForm && (
        <MenuItemForm
          categories={categories}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmitItem}
          onCancel={closeItemForm}
          isEditing={!!editingItem}
          onAddModifierOption={handleAddModifierOption}
          onDeleteModifierOption={handleDeleteModifierOption}
        />
      )}

      {isAdmin && showCategoryManager && (
        <CategoryManager
          categories={categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: "#f7f7f8",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  categoryBar: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  categoryButton: {
    border: "1px solid #d1d5db",
    borderRadius: "999px",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 500,
  },
  categoryButtonActive: {
    background: "#111827",
    color: "#fff",
    border: "1px solid #111827",
  },
};

export default MenuPage;