import MenuCard from "./MenuCard";

function MenuGrid({
  items,
  isAdmin,
  getCategoryName,
  onEditItem,
  onDeleteItem,
  onAddToOrder,
}) {
  if (!items.length) {
    return <p>No menu items found.</p>;
  }

  return (
    <div style={styles.grid}>
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          isAdmin={isAdmin}
          categoryName={getCategoryName(item.categoryId)}
          onEdit={() => onEditItem(item)}
          onDelete={() => onDeleteItem(item)}
          onAddToOrder={() => onAddToOrder(item)}
        />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "16px",
  },
};

export default MenuGrid;