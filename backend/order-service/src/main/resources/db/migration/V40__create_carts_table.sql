IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'carts'
      AND s.name = 'orders'
)
    BEGIN
        CREATE TABLE orders.carts (
                                      id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,

                                      table_session_id BIGINT NOT NULL,
                                      guest_session_id BIGINT NOT NULL,
                                      table_id BIGINT NOT NULL,
                                      table_name NVARCHAR(100) NULL,

                                      status NVARCHAR(50) NOT NULL CONSTRAINT DF_carts_status DEFAULT ('ACTIVE'),

                                      subtotal_amount DECIMAL(10,2) NOT NULL CONSTRAINT DF_carts_subtotal_amount DEFAULT (0),
                                      total_amount DECIMAL(10,2) NOT NULL CONSTRAINT DF_carts_total_amount DEFAULT (0),

                                      created_at DATETIME2 NOT NULL CONSTRAINT DF_carts_created_at DEFAULT (SYSUTCDATETIME()),
                                      updated_at DATETIME2 NULL,
                                      ordered_at DATETIME2 NULL,
                                      cleared_at DATETIME2 NULL
        );

        CREATE INDEX IX_carts_table_session_id
            ON orders.carts(table_session_id);

        CREATE INDEX IX_carts_guest_session_id
            ON orders.carts(guest_session_id);

        CREATE INDEX IX_carts_table_id
            ON orders.carts(table_id);

        CREATE INDEX IX_carts_status
            ON orders.carts(status);

        CREATE INDEX IX_carts_table_session_status
            ON orders.carts(table_session_id, status);

        CREATE INDEX IX_carts_guest_session_status
            ON orders.carts(guest_session_id, status);

        CREATE UNIQUE INDEX UX_carts_active_guest_session
            ON orders.carts(table_session_id, guest_session_id, status)
            WHERE status = 'ACTIVE';

        ALTER TABLE orders.carts
            ADD CONSTRAINT CK_carts_status
                CHECK (status IN ('ACTIVE', 'ORDERED', 'CLEARED', 'CANCELLED'));

        ALTER TABLE orders.carts
            ADD CONSTRAINT CK_carts_subtotal_amount_non_negative
                CHECK (subtotal_amount >= 0);

        ALTER TABLE orders.carts
            ADD CONSTRAINT CK_carts_total_amount_non_negative
                CHECK (total_amount >= 0);
    END;