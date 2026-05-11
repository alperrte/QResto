IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'order_items'
      AND s.name = 'orders'
)
    BEGIN
        CREATE TABLE orders.order_items (
                                            id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,

                                            order_id BIGINT NOT NULL,

                                            product_id BIGINT NOT NULL,
                                            product_name NVARCHAR(150) NOT NULL,
                                            product_price DECIMAL(10,2) NOT NULL,
                                            vat_included BIT NOT NULL CONSTRAINT DF_order_items_vat_included DEFAULT (1),

                                            quantity INT NOT NULL CONSTRAINT DF_order_items_quantity DEFAULT (1),

                                            removed_ingredients NVARCHAR(1500) NULL,
                                            added_ingredients NVARCHAR(1500) NULL,
                                            note NVARCHAR(500) NULL,

                                            line_total DECIMAL(10,2) NOT NULL CONSTRAINT DF_order_items_line_total DEFAULT (0),

                                            status NVARCHAR(50) NOT NULL CONSTRAINT DF_order_items_status DEFAULT ('ACTIVE'),
                                            cancel_reason NVARCHAR(500) NULL,
                                            cancelled_at DATETIME2 NULL,

                                            created_at DATETIME2 NOT NULL CONSTRAINT DF_order_items_created_at DEFAULT (SYSUTCDATETIME()),
                                            updated_at DATETIME2 NULL,

                                            CONSTRAINT FK_order_items_order
                                                FOREIGN KEY (order_id) REFERENCES orders.customer_orders(id)
                                                    ON DELETE CASCADE
        );

        CREATE INDEX IX_order_items_order_id
            ON orders.order_items(order_id);

        CREATE INDEX IX_order_items_product_id
            ON orders.order_items(product_id);

        CREATE INDEX IX_order_items_status
            ON orders.order_items(status);

        ALTER TABLE orders.order_items
            ADD CONSTRAINT CK_order_items_product_price_non_negative
                CHECK (product_price >= 0);

        ALTER TABLE orders.order_items
            ADD CONSTRAINT CK_order_items_quantity_positive
                CHECK (quantity > 0);

        ALTER TABLE orders.order_items
            ADD CONSTRAINT CK_order_items_line_total_non_negative
                CHECK (line_total >= 0);

        ALTER TABLE orders.order_items
            ADD CONSTRAINT CK_order_items_status
                CHECK (status IN ('ACTIVE', 'CANCELLED'));
    END;