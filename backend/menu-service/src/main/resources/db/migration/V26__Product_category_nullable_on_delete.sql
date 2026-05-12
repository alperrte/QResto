-- Kategori silindiğinde ürünler kategorisiz kalabilir (menüde yalnızca "Tümü" altında listelenir).
IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys fk
    INNER JOIN sys.tables t ON t.object_id = fk.parent_object_id
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE fk.name = N'FK_product_category'
      AND t.name = N'product'
      AND s.name = N'menu'
)
BEGIN
    ALTER TABLE menu.product DROP CONSTRAINT FK_product_category;
END;

IF EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.tables t ON t.object_id = c.object_id
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = N'product'
      AND s.name = N'menu'
      AND c.name = N'category_id'
      AND c.is_nullable = 0
)
BEGIN
    ALTER TABLE menu.product ALTER COLUMN category_id BIGINT NULL;
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys fk
    INNER JOIN sys.tables t ON t.object_id = fk.parent_object_id
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE fk.name = N'FK_product_category'
      AND t.name = N'product'
      AND s.name = N'menu'
)
BEGIN
    ALTER TABLE menu.product ADD CONSTRAINT FK_product_category
        FOREIGN KEY (category_id) REFERENCES menu.category(id) ON DELETE SET NULL;
END;
