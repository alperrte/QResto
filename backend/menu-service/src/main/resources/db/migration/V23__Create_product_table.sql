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

IF EXISTS (
    SELECT 1
    FROM sys.tables t
    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
    WHERE t.name = 'product'
      AND s.name = 'menu'
)
BEGIN
    INSERT INTO menu.product (
        category_id,
        sub_category_id,
        name,
        description,
        price,
        image_url,
        vat_included,
        ingredients,
        removable_ingredients,
        addable_ingredients,
        calorie,
        gram,
        prep_time_min,
        avg_rating,
        active,
        in_stock
    )
    SELECT
        c.id,
        NULL,
        seed.name,
        seed.description,
        seed.price,
        seed.image_url,
        1,
        seed.ingredients,
        seed.removable_ingredients,
        seed.addable_ingredients,
        seed.calorie,
        seed.gram,
        seed.prep_time_min,
        seed.avg_rating,
        1,
        1
    FROM (
        VALUES
            (N'Başlangıçlar', N'Mercimek Çorbası', N'Günlük taze mercimek çorbası.', CAST(95.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', N'mercimek,havuç,soğan', N'', N'limon,biber', 180, 320, 10, CAST(4.50 AS DECIMAL(3,2))),
            (N'Başlangıçlar', N'Çıtır Patates', N'Baharatlı ve çıtır patates kızartması.', CAST(110.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1576107232684-1279f390859f', N'patates,baharat', N'tuz', N'ketçap,mayonez', 340, 200, 12, CAST(4.30 AS DECIMAL(3,2))),
            (N'Ana Yemekler', N'Izgara Tavuk', N'Sebzeli ızgara tavuk fileto.', CAST(245.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1643594462181-7667928d072e?auto=format&fit=crop&w=1200&q=80', N'tavuk,sebze,zeytinyağı', N'', N'ek sos', 520, 380, 20, CAST(4.60 AS DECIMAL(3,2))),
            (N'Ana Yemekler', N'Et Pirzola', N'Özel soslu dana pirzola.', CAST(295.00 AS DECIMAL(10,2)), N'https://plus.unsplash.com/premium_photo-1723478557023-1f739ec06671?auto=format&fit=crop&w=1200&q=80', N'dana eti,biber,soğan', N'', N'ekmek', 640, 420, 22, CAST(4.70 AS DECIMAL(3,2))),
            (N'Pizzalar', N'Margarita Pizza', N'Mozzarella ve domates soslu klasik pizza.', CAST(210.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80', N'mozzarella,domates sosu', N'sarımsak', N'ekstra peynir,zeytin', 760, 510, 18, CAST(4.40 AS DECIMAL(3,2))),
            (N'Pizzalar', N'Karışık Pizza', N'Sucuk, salam ve sebzeli özel pizza.', CAST(255.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1200&q=80', N'mozzarella,sucuk,salam,biber', N'zeytin', N'ekstra kaşar', 890, 540, 20, CAST(4.55 AS DECIMAL(3,2))),
            (N'Burgerler', N'Klasik Burger', N'Izgara köfte, cheddar ve özel sos.', CAST(235.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', N'köfte,cheddar,marul', N'soğan,turşu', N'ekstra cheddar', 810, 360, 16, CAST(4.45 AS DECIMAL(3,2))),
            (N'Burgerler', N'Acılı Tavuk Burger', N'Çıtır tavuk ve acı sos ile.', CAST(225.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=80', N'tavuk,acı sos,marul', N'soğan', N'jalapeno,ekstra sos', 780, 340, 15, CAST(4.35 AS DECIMAL(3,2))),
            (N'Tatlılar', N'Vişneli Cheesecake', N'Akışkan kıvamlı cheesecake.', CAST(165.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1533134242443-d4fd215305ad', N'peynir,yumurta,krema', N'', N'çikolata sosu', 430, 180, 8, CAST(4.80 AS DECIMAL(3,2))),
            (N'Tatlılar', N'Sufle', N'Sıcak servis edilen çikolatalı sufle.', CAST(150.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', N'çikolata,un,yumurta', N'', N'dondurma', 410, 170, 9, CAST(4.65 AS DECIMAL(3,2))),
            (N'İçecekler', N'Ev Yapımı Limonata', N'Taze sıkım limonata.', CAST(70.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e', N'limon,su,nane', N'', N'buz', 95, 300, 5, CAST(4.20 AS DECIMAL(3,2))),
            (N'İçecekler', N'Soğuk Kahve', N'Sütlü soğuk kahve.', CAST(85.00 AS DECIMAL(10,2)), N'https://images.unsplash.com/photo-1461023058943-07fcbe16d735', N'kahve,süt,buz', N'şeker', N'vanilya şurubu', 160, 280, 6, CAST(4.25 AS DECIMAL(3,2)))
    ) AS seed(
        category_name,
        name,
        description,
        price,
        image_url,
        ingredients,
        removable_ingredients,
        addable_ingredients,
        calorie,
        gram,
        prep_time_min,
        avg_rating
    )
    INNER JOIN menu.category c ON c.name = seed.category_name
    WHERE NOT EXISTS (
        SELECT 1
        FROM menu.product p
        WHERE p.name = seed.name
          AND p.category_id = c.id
    );
END;