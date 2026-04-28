IF NOT EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'category'
      AND s.name = 'menu'
)
BEGIN
    CREATE TABLE menu.category (
        id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        active BIT NOT NULL CONSTRAINT DF_category_active DEFAULT (1),
        created_at DATETIME2 NOT NULL CONSTRAINT DF_category_created_at DEFAULT (SYSUTCDATETIME()),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_category_updated_at DEFAULT (SYSUTCDATETIME())
    );

    CREATE UNIQUE INDEX UX_category_name ON menu.category(name);
    CREATE INDEX IX_category_active ON menu.category(active);
END;