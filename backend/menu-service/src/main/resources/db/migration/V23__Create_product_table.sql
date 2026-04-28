IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'product'
      AND s.name = 'menu'
)
BEGIN
    CREATE TABLE menu.product (
        id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        category_id BIGINT NOT NULL,
        sub_category_id BIGINT NULL,

        name NVARCHAR(150) NOT NULL,
        description NVARCHAR(1000) NULL,
        price DECIMAL(10,2) NOT NULL,

        image_url NVARCHAR(500) NULL,
        vat_included BIT NOT NULL CONSTRAINT DF_product_vat_included DEFAULT (1),

        ingredients NVARCHAR(1500) NULL,
        removable_ingredients NVARCHAR(1500) NULL,
        addable_ingredients NVARCHAR(1500) NULL,

        calorie INT NULL,
        gram INT NULL,
        prep_time_min INT NULL,

        avg_rating DECIMAL(3,2) NOT NULL CONSTRAINT DF_product_avg_rating DEFAULT (0),

        active BIT NOT NULL CONSTRAINT DF_product_active DEFAULT (1),
        in_stock BIT NOT NULL CONSTRAINT DF_product_in_stock DEFAULT (1),

        created_at DATETIME2 NOT NULL CONSTRAINT DF_product_created_at DEFAULT (SYSUTCDATETIME()),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_product_updated_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_product_category
            FOREIGN KEY (category_id) REFERENCES menu.category(id),

        CONSTRAINT FK_product_sub_category
            FOREIGN KEY (sub_category_id) REFERENCES menu.sub_category(id),

        CONSTRAINT CK_product_price_non_negative CHECK (price >= 0),
        CONSTRAINT CK_product_avg_rating_range CHECK (avg_rating >= 0 AND avg_rating <= 5),
        CONSTRAINT CK_product_calorie_non_negative CHECK (calorie IS NULL OR calorie >= 0),
        CONSTRAINT CK_product_gram_non_negative CHECK (gram IS NULL OR gram >= 0),
        CONSTRAINT CK_product_prep_time_non_negative CHECK (prep_time_min IS NULL OR prep_time_min >= 0)
    );

    CREATE INDEX IX_product_category_id
        ON menu.product(category_id);

    CREATE INDEX IX_product_sub_category_id
        ON menu.product(sub_category_id);

    CREATE INDEX IX_product_active_in_stock
        ON menu.product(active, in_stock);

    CREATE INDEX IX_product_name
        ON menu.product(name);
END;