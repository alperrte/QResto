IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'sub_category'
      AND s.name = 'menu'
)
BEGIN
    CREATE TABLE menu.sub_category (
        id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        category_id BIGINT NOT NULL,
        name NVARCHAR(100) NOT NULL,
        active BIT NOT NULL CONSTRAINT DF_sub_category_active DEFAULT (1),
        created_at DATETIME2 NOT NULL CONSTRAINT DF_sub_category_created_at DEFAULT (SYSUTCDATETIME()),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_sub_category_updated_at DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT FK_sub_category_category
            FOREIGN KEY (category_id) REFERENCES menu.category(id)
    );

    -- Aynı kategori altında aynı isim tekrar etmesin
    CREATE UNIQUE INDEX UX_sub_category_category_name
        ON menu.sub_category(category_id, name);

    CREATE INDEX IX_sub_category_category_id
        ON menu.sub_category(category_id);

    CREATE INDEX IX_sub_category_active
        ON menu.sub_category(active);
END;

IF EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'category'
      AND s.name = 'menu'
)
BEGIN
    INSERT INTO menu.category (name, active)
    SELECT seed.name, 1
    FROM (
        VALUES
            (N'Başlangıçlar'),
            (N'Ana Yemekler'),
            (N'Pizzalar'),
            (N'Burgerler'),
            (N'Tatlılar'),
            (N'İçecekler')
    ) AS seed(name)
    WHERE NOT EXISTS (
        SELECT 1
        FROM menu.category c
        WHERE c.name = seed.name
    );
END;