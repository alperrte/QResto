CREATE TABLE orders.cart_items (
                                   id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,

                                   cart_id BIGINT NOT NULL,

                                   product_id BIGINT NOT NULL,
                                   product_name NVARCHAR(150) NOT NULL,
                                   product_price DECIMAL(10,2) NOT NULL,
                                   vat_included BIT NOT NULL CONSTRAINT DF_cart_items_vat_included DEFAULT (1),

                                   quantity INT NOT NULL CONSTRAINT DF_cart_items_quantity DEFAULT (1),

                                   removed_ingredients NVARCHAR(1500) NULL,
                                   added_ingredients NVARCHAR(1500) NULL,
                                   note NVARCHAR(500) NULL,

                                   line_total DECIMAL(10,2) NOT NULL CONSTRAINT DF_cart_items_line_total DEFAULT (0),

                                   created_at DATETIME2 NOT NULL CONSTRAINT DF_cart_items_created_at DEFAULT (SYSUTCDATETIME()),
                                   updated_at DATETIME2 NULL,

                                   CONSTRAINT FK_cart_items_cart
                                       FOREIGN KEY (cart_id) REFERENCES orders.carts(id)
                                           ON DELETE CASCADE
);

CREATE INDEX IX_cart_items_cart_id
    ON orders.cart_items(cart_id);

CREATE INDEX IX_cart_items_product_id
    ON orders.cart_items(product_id);

ALTER TABLE orders.cart_items
    ADD CONSTRAINT CK_cart_items_product_price_non_negative
        CHECK (product_price >= 0);

ALTER TABLE orders.cart_items
    ADD CONSTRAINT CK_cart_items_quantity_positive
        CHECK (quantity > 0);

ALTER TABLE orders.cart_items
    ADD CONSTRAINT CK_cart_items_line_total_non_negative
        CHECK (line_total >= 0);