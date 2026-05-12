IF NOT EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.tables t ON t.object_id = c.object_id
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE s.name = 'menu'
      AND t.name = 'product'
      AND c.name = 'order_note_enabled'
)
BEGIN
    ALTER TABLE menu.product
        ADD order_note_enabled BIT NOT NULL CONSTRAINT DF_product_order_note_enabled DEFAULT (0);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.tables t ON t.object_id = c.object_id
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE s.name = 'menu'
      AND t.name = 'product'
      AND c.name = 'order_note_title'
)
BEGIN
    ALTER TABLE menu.product
        ADD order_note_title NVARCHAR(200) NULL;
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'product_option_group'
      AND s.name = 'menu'
)
BEGIN
    CREATE TABLE menu.product_option_group (
        id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        product_id BIGINT NOT NULL,
        sort_order INT NOT NULL CONSTRAINT DF_pog_sort DEFAULT (0),
        kind NVARCHAR(20) NOT NULL,
        has_price BIT NOT NULL CONSTRAINT DF_pog_has_price DEFAULT (1),
        user_title NVARCHAR(200) NOT NULL CONSTRAINT DF_pog_user_title DEFAULT (N''),
        meta_title NVARCHAR(200) NOT NULL CONSTRAINT DF_pog_meta_title DEFAULT (N''),
        description_line NVARCHAR(500) NULL,
        required BIT NOT NULL CONSTRAINT DF_pog_required DEFAULT (0),
        max_select INT NOT NULL CONSTRAINT DF_pog_max_select DEFAULT (1),
        included_in_preview BIT NOT NULL CONSTRAINT DF_pog_in_preview DEFAULT (0),

        CONSTRAINT FK_pog_product
            FOREIGN KEY (product_id) REFERENCES menu.product(id) ON DELETE CASCADE,

        CONSTRAINT CK_pog_kind CHECK (kind IN (N'portion', N'single', N'multi')),
        CONSTRAINT CK_pog_max_select_positive CHECK (max_select >= 1)
    );

    CREATE INDEX IX_pog_product_sort
        ON menu.product_option_group(product_id, sort_order);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'product_option_choice'
      AND s.name = 'menu'
)
BEGIN
    CREATE TABLE menu.product_option_choice (
        id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        option_group_id BIGINT NOT NULL,
        sort_order INT NOT NULL CONSTRAINT DF_poc_sort DEFAULT (0),
        label NVARCHAR(200) NOT NULL,
        price_delta DECIMAL(10,2) NOT NULL CONSTRAINT DF_poc_price_delta DEFAULT (0),

        CONSTRAINT FK_poc_group
            FOREIGN KEY (option_group_id) REFERENCES menu.product_option_group(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_poc_group_sort
        ON menu.product_option_choice(option_group_id, sort_order);
END;
