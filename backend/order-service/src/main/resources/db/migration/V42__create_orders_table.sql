IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'customer_orders'
      AND s.name = 'orders'
)
    BEGIN
        CREATE TABLE orders.customer_orders (
                                                id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,

                                                order_no NVARCHAR(50) NOT NULL,

                                                cart_id BIGINT NULL,

                                                table_session_id BIGINT NOT NULL,
                                                guest_session_id BIGINT NOT NULL,
                                                table_id BIGINT NOT NULL,
                                                table_name NVARCHAR(100) NULL,

                                                status NVARCHAR(50) NOT NULL CONSTRAINT DF_customer_orders_status DEFAULT ('RECEIVED'),

                                                subtotal_amount DECIMAL(10,2) NOT NULL CONSTRAINT DF_customer_orders_subtotal_amount DEFAULT (0),
                                                vat_amount DECIMAL(10,2) NOT NULL CONSTRAINT DF_customer_orders_vat_amount DEFAULT (0),
                                                total_amount DECIMAL(10,2) NOT NULL CONSTRAINT DF_customer_orders_total_amount DEFAULT (0),

                                                cancel_reason NVARCHAR(500) NULL,

                                                created_at DATETIME2 NOT NULL CONSTRAINT DF_customer_orders_created_at DEFAULT (SYSUTCDATETIME()),
                                                updated_at DATETIME2 NULL,

                                                received_at DATETIME2 NULL,
                                                preparing_at DATETIME2 NULL,
                                                ready_at DATETIME2 NULL,
                                                served_at DATETIME2 NULL,
                                                completed_at DATETIME2 NULL,
                                                payment_pending_at DATETIME2 NULL,
                                                paid_at DATETIME2 NULL,
                                                cancelled_at DATETIME2 NULL,

                                                CONSTRAINT FK_customer_orders_cart
                                                    FOREIGN KEY (cart_id) REFERENCES orders.carts(id)
        );

        CREATE UNIQUE INDEX UX_customer_orders_order_no
            ON orders.customer_orders(order_no);

        CREATE INDEX IX_customer_orders_cart_id
            ON orders.customer_orders(cart_id);

        CREATE INDEX IX_customer_orders_table_session_id
            ON orders.customer_orders(table_session_id);

        CREATE INDEX IX_customer_orders_guest_session_id
            ON orders.customer_orders(guest_session_id);

        CREATE INDEX IX_customer_orders_table_id
            ON orders.customer_orders(table_id);

        CREATE INDEX IX_customer_orders_status
            ON orders.customer_orders(status);

        CREATE INDEX IX_customer_orders_table_session_status
            ON orders.customer_orders(table_session_id, status);

        ALTER TABLE orders.customer_orders
            ADD CONSTRAINT CK_customer_orders_status
                CHECK (
                    status IN (
                               'RECEIVED',
                               'PREPARING',
                               'READY',
                               'SERVED',
                               'COMPLETED',
                               'PAYMENT_PENDING',
                               'PAID',
                               'CANCELLED'
                        )
                    );

        ALTER TABLE orders.customer_orders
            ADD CONSTRAINT CK_customer_orders_subtotal_amount_non_negative
                CHECK (subtotal_amount >= 0);

        ALTER TABLE orders.customer_orders
            ADD CONSTRAINT CK_customer_orders_vat_amount_non_negative
                CHECK (vat_amount >= 0);

        ALTER TABLE orders.customer_orders
            ADD CONSTRAINT CK_customer_orders_total_amount_non_negative
                CHECK (total_amount >= 0);
    END;