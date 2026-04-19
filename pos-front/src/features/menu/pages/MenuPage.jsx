import { useEffect, useMemo, useRef, useState } from "react";
import { ROLES } from "../../../constants/roles";
import MenuGrid from "../components/MenuGrid";
import MenuItemForm from "../components/MenuItemForm";
import CategoryManager from "../components/CategoryManager";
import WaiterModifierModal from "../components/WaiterModifierModal";

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
      switchPairs: [{ from: "Fries", to: "Salad" }],
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
      switchPairs: [{ from: "Fries", to: "Coleslaw" }],
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
      switchPairs: [{ from: "Medium", to: "Large" }],
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
      switchPairs: [{ from: "Chocolate Syrup", to: "Caramel Syrup" }],
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
    switchPairs: [],
  },
});

const createEmptyCustomerInfo = (orderType = "to-go") => ({
  orderType,
  phoneNumber: "",
  customerName: "",
  address: "",
  note: "",
});

function CustomerInfoModal({ formData, onChange, onSave, onClose }) {
  if (!formData) return null;

  const isDelivery = formData.orderType === "delivery";

  return (
    <div style={styles.overlay}>
      <div style={styles.customerModal}>
        <div style={styles.customerModalHeader}>
          <div>
            <h2 style={styles.customerModalTitle}>
              {isDelivery ? "Delivery Customer Info" : "To-Go Customer Info"}
            </h2>
            <p style={styles.customerModalSubtitle}>
              Fill in customer details before ordering.
            </p>
          </div>

          <button type="button" onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.customerFormGrid}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={onChange}
              placeholder="Enter phone number"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Name</label>
            <input
              name="customerName"
              value={formData.customerName}
              onChange={onChange}
              placeholder="Enter customer name"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={onChange}
              placeholder="Enter address"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={onChange}
              placeholder="Enter note"
              style={styles.textarea}
            />
          </div>
        </div>

        <div style={styles.customerModalFooter}>
          <button type="button" onClick={onSave} style={styles.primaryButton}>
            Save
          </button>

          <button type="button" style={styles.secondaryButton}>
            History
          </button>

          <button type="button" onClick={onClose} style={styles.returnButton}>
            Return
          </button>
        </div>
      </div>
    </div>
  );
}

function ChooseOrderTypeModal({
  onClose,
  onChooseDining,
  onChooseToGo,
  onChooseDelivery,
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.chooseTypeModal}>
        <div style={styles.chooseTypeHeader}>
          <h2 style={styles.chooseTypeTitle}>Choose Order Type</h2>
          <button type="button" onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.chooseTypeButtonWrap}>
          <button
            type="button"
            onClick={onChooseDining}
            style={styles.typeChoiceButton}
          >
            Dining
          </button>

          <button
            type="button"
            onClick={onChooseToGo}
            style={styles.typeChoiceButton}
          >
            To-Go
          </button>

          <button
            type="button"
            onClick={onChooseDelivery}
            style={styles.typeChoiceButton}
          >
            Delivery
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuPage({
  role,
  selectedTableId,
  activeServiceMode = "dining",
  activeCustomerOrder = null,
  onAddToCart,
  onOpenDining,
  onStartDiningSelection,
  onCustomerInfoSave,
  onCreateCustomerOrderAndAddItem,
}) {
  const isAdmin = role === ROLES.ADMIN;
  const isWaiter = role === ROLES.WAITER;

  const [modifierModalItem, setModifierModalItem] = useState(null);
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(createEmptyForm());

  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(
    createEmptyCustomerInfo("to-go")
  );

  const [showChooseTypeModal, setShowChooseTypeModal] = useState(false);
  const [queuedItemForTypeChoice, setQueuedItemForTypeChoice] = useState(null);

  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const floatingRef = useRef(null);

  useEffect(() => {
    if (!showFloatingActions) return;

    const handleClickOutside = (event) => {
      if (!floatingRef.current) return;
      if (!floatingRef.current.contains(event.target)) {
        setShowFloatingActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFloatingActions]);

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === "all") return items;
    return items.filter((item) => item.categoryId === selectedCategoryId);
  }, [items, selectedCategoryId]);

  const getCategoryName = (categoryId) =>
    categories.find((category) => category.id === categoryId)?.name || "Unknown";

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
        switchPairs: item.modifiers?.switchPairs || [],
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

  const handleAddSwitchPair = (pair) => {
    const from = pair.from.trim();
    const to = pair.to.trim();

    if (!from || !to) return;

    setFormData((prev) => {
      const exists = prev.modifiers.switchPairs.some(
        (item) =>
          item.from.toLowerCase() === from.toLowerCase() &&
          item.to.toLowerCase() === to.toLowerCase()
      );

      if (exists) return prev;

      return {
        ...prev,
        modifiers: {
          ...prev.modifiers,
          switchPairs: [...prev.modifiers.switchPairs, { from, to }],
        },
      };
    });
  };

  const handleDeleteSwitchPair = (indexToDelete) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: {
        ...prev.modifiers,
        switchPairs: prev.modifiers.switchPairs.filter(
          (_, index) => index !== indexToDelete
        ),
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
        switchPairs: formData.modifiers.switchPairs,
      },
    };

    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...payload } : item
        )
      );
    } else {
      setItems((prev) => [...prev, { id: Date.now(), ...payload }]);
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

    setCategories((prev) => [...prev, { id: Date.now(), name: trimmed }]);
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

    setCategories((prev) =>
      prev.filter((category) => category.id !== categoryId)
    );
    setItems((prev) => prev.filter((item) => item.categoryId !== categoryId));

    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId("all");
    }
  };

  const handleToggleCategory = (categoryId) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId("all");
      return;
    }
    setSelectedCategoryId(categoryId);
  };

  const openCustomerInfoModal = (orderType) => {
    setCustomerInfo(createEmptyCustomerInfo(orderType));
    setShowCustomerInfoModal(true);
    setShowFloatingActions(false);
    setShowChooseTypeModal(false);
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveCustomerInfo = () => {
    const payload = {
      ...customerInfo,
      phoneNumber: customerInfo.phoneNumber.trim(),
      customerName: customerInfo.customerName.trim(),
      address: customerInfo.address.trim(),
      note: customerInfo.note.trim(),
    };

    if (queuedItemForTypeChoice) {
      onCreateCustomerOrderAndAddItem?.(payload, queuedItemForTypeChoice);
      setQueuedItemForTypeChoice(null);
    } else {
      onCustomerInfoSave?.(payload);
    }

    setShowCustomerInfoModal(false);
  };

  const normalizeOrderItem = (item) => ({
    ...item,
    quantity: item.quantity || 1,
    selectedModifiers: item.selectedModifiers || {
      add: [],
      no: [],
      switchPair: null,
    },
  });

  const hasActiveContext =
    !!selectedTableId ||
    (activeServiceMode !== "dining" && !!activeCustomerOrder);

  const handleAddToOrder = (item) => {
    const normalizedItem = normalizeOrderItem(item);

    if (hasActiveContext) {
      onAddToCart?.(normalizedItem);
      return;
    }

    setQueuedItemForTypeChoice(normalizedItem);
    setShowChooseTypeModal(true);
  };

  const handleOpenSettings = (item) => {
    setModifierModalItem(item);
  };

  const handleConfirmModifierOrder = (itemWithSelections) => {
    const normalizedItem = normalizeOrderItem(itemWithSelections);

    if (hasActiveContext) {
      onAddToCart?.(normalizedItem);
      setModifierModalItem(null);
      return;
    }

    setQueuedItemForTypeChoice(normalizedItem);
    setModifierModalItem(null);
    setShowChooseTypeModal(true);
  };

  const handleChooseDiningFromNew = () => {
    setShowFloatingActions(false);
    onOpenDining?.();
  };

  const handleChooseDiningForQueuedItem = () => {
    if (!queuedItemForTypeChoice) return;
    onStartDiningSelection?.(queuedItemForTypeChoice);
    setQueuedItemForTypeChoice(null);
    setShowChooseTypeModal(false);
  };

  const handleChooseToGoForQueuedItem = () => {
    if (!queuedItemForTypeChoice) return;
    setCustomerInfo(createEmptyCustomerInfo("to-go"));
    setShowCustomerInfoModal(true);
    setShowChooseTypeModal(false);
  };

  const handleChooseDeliveryForQueuedItem = () => {
    if (!queuedItemForTypeChoice) return;
    setCustomerInfo(createEmptyCustomerInfo("delivery"));
    setShowCustomerInfoModal(true);
    setShowChooseTypeModal(false);
  };

  return (
    <div style={styles.page}>
      {isAdmin && (
        <div style={styles.headerActions}>
          <button type="button" style={styles.primaryButton} onClick={openAddForm}>
            Add Item
          </button>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => setShowCategoryManager(true)}
          >
            Manage Categories
          </button>
        </div>
      )}

      <div style={styles.categoryBar}>
        <button
          type="button"
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
            type="button"
            style={{
              ...styles.categoryButton,
              ...(selectedCategoryId === category.id
                ? styles.categoryButtonActive
                : {}),
            }}
            onClick={() => handleToggleCategory(category.id)}
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
          onAddToOrder={handleAddToOrder}
          onOpenSettings={handleOpenSettings}
          onOpenWaiterCustomize={handleOpenSettings}
        />

      {isWaiter && (
        <div style={styles.floatingWrap} ref={floatingRef}>
          {showFloatingActions && (
            <div style={styles.floatingBar}>
              <button
                type="button"
                style={styles.floatingActionButton}
                onClick={handleChooseDiningFromNew}
              >
                Dining
              </button>

              <button
                type="button"
                style={styles.floatingActionButton}
                onClick={() => openCustomerInfoModal("to-go")}
              >
                To-Go
              </button>

              <button
                type="button"
                style={styles.floatingActionButtonNoBorder}
                onClick={() => openCustomerInfoModal("delivery")}
              >
                Delivery
              </button>
            </div>
          )}

          <button
            type="button"
            style={styles.floatingNewButton}
            onClick={() => setShowFloatingActions((prev) => !prev)}
          >
            New
          </button>
        </div>
      )}

      {showItemForm && (
        <MenuItemForm
          categories={categories}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmitItem}
          onCancel={closeItemForm}
          isEditing={!!editingItem}
          onAddModifierOption={handleAddModifierOption}
          onDeleteModifierOption={handleDeleteModifierOption}
          onAddSwitchPair={handleAddSwitchPair}
          onDeleteSwitchPair={handleDeleteSwitchPair}
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

      {modifierModalItem && (
        <WaiterModifierModal
          item={modifierModalItem}
          onClose={() => setModifierModalItem(null)}
          onConfirm={handleConfirmModifierOrder}
        />
      )}

      {showCustomerInfoModal && (
        <CustomerInfoModal
          formData={customerInfo}
          onChange={handleCustomerInfoChange}
          onSave={handleSaveCustomerInfo}
          onClose={() => {
            setShowCustomerInfoModal(false);
            setQueuedItemForTypeChoice(null);
          }}
        />
      )}

      {showChooseTypeModal && (
        <ChooseOrderTypeModal
          onClose={() => {
            setShowChooseTypeModal(false);
            setQueuedItemForTypeChoice(null);
          }}
          onChooseDining={handleChooseDiningForQueuedItem}
          onChooseToGo={handleChooseToGoForQueuedItem}
          onChooseDelivery={handleChooseDeliveryForQueuedItem}
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
  headerCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  headerTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  headerLeftBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  headerRightBlock: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  tableInfo: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },
  typeSelect: {
    minWidth: "140px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "4px",
    marginBottom: "20px",
  },
  primaryButton: {
    border: "none",
    borderRadius: "12px",
    background: "#111827",
    color: "#fff",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 600,
    minWidth: "110px",
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    background: "#fff",
    color: "#111827",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 600,
    minWidth: "110px",
  },
  returnButton: {
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    background: "#f9fafb",
    color: "#111827",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 600,
    minWidth: "110px",
  },
  categoryBar: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
    justifyContent: "center",
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
  floatingWrap: {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    zIndex: 1200,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  floatingBar: {
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  },
  floatingActionButton: {
    border: "none",
    borderRight: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#111827",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: 700,
    minWidth: "96px",
  },
  floatingActionButtonNoBorder: {
    border: "none",
    background: "#ffffff",
    color: "#111827",
    padding: "14px 18px",
    cursor: "pointer",
    fontWeight: 700,
    minWidth: "96px",
  },
  floatingNewButton: {
    border: "none",
    borderRadius: "999px",
    background: "#111827",
    color: "#fff",
    width: "72px",
    height: "72px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "16px",
    boxShadow: "0 16px 30px rgba(17,24,39,0.28)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    padding: "20px",
    zIndex: 1300,
  },
  chooseTypeModal: {
    width: "100%",
    maxWidth: "520px",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  chooseTypeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  chooseTypeTitle: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },
  chooseTypeButtonWrap: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  typeChoiceButton: {
    border: "none",
    borderRadius: "14px",
    background: "#111827",
    color: "#fff",
    padding: "16px 18px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "16px",
  },
  customerModal: {
    width: "100%",
    maxWidth: "720px",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  customerModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  customerModalTitle: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },
  customerModalSubtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },
  closeButton: {
    width: "44px",
    height: "44px",
    border: "none",
    borderRadius: "999px",
    background: "#f3f4f6",
    fontSize: "26px",
    lineHeight: 1,
    cursor: "pointer",
  },
  customerFormGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
    textAlign: "left",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    width: "100%",
    background: "#fff",
    minHeight: "48px",
    boxSizing: "border-box",
    fontSize: "15px",
  },
  textarea: {
    minHeight: "140px",
    resize: "vertical",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    width: "100%",
    fontFamily: "inherit",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  customerModalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
  },
};

export default MenuPage;