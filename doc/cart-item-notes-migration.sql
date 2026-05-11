CREATE TABLE cart_item_notes (
  id bigint unsigned NOT NULL AUTO_INCREMENT,
  cart_item_id bigint unsigned NOT NULL,
  note varchar(255) NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_cart_item_notes_cart_item_idx (cart_item_id),
  CONSTRAINT fk_cart_item_notes_cart_item
    FOREIGN KEY (cart_item_id)
    REFERENCES cart_items (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
