/*
 * V23 seed ürünlerinde (Mercimek Çorbası vb.) opsiyon yoktu — API boş, müşteri ekranı sabit şablona düşüyordu.
 * Sadece hiç opsiyon grubu olmayan ürünlere demo grupları ekler.
 * Geçici işaret: description_line = N'[seed:v25-portion]' / N'[seed:v25-multi]' (sonunda NULL yapılır).
 */
DECLARE @marker_portion NVARCHAR(50) = N'[seed:v25-portion]';
DECLARE @marker_multi   NVARCHAR(50) = N'[seed:v25-multi]';

IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = N'menu'
      AND TABLE_NAME = N'product_option_group'
)
   AND EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = N'menu'
      AND TABLE_NAME = N'product_option_choice'
)
BEGIN
    INSERT INTO menu.product_option_group (
        product_id,
        sort_order,
        kind,
        has_price,
        user_title,
        meta_title,
        description_line,
        required,
        max_select,
        included_in_preview
    )
    SELECT
        p.id,
        0,
        N'portion',
        1,
        N'',
        N'Porsiyon',
        @marker_portion,
        1,
        1,
        1
    FROM menu.product p
    WHERE NOT EXISTS (
        SELECT 1
        FROM menu.product_option_group g
        WHERE g.product_id = p.id
    );

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id,
           0,
           N'Standart porsiyon',
           CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g
    WHERE g.description_line = @marker_portion
      AND g.kind = N'portion'
      AND NOT EXISTS (
          SELECT 1
          FROM menu.product_option_choice c
          WHERE c.option_group_id = g.id
      );

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id,
           1,
           N'Büyük porsiyon',
           CAST(30.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group g
    WHERE g.description_line = @marker_portion
      AND g.kind = N'portion'
      AND (
          SELECT COUNT(*)
          FROM menu.product_option_choice c
          WHERE c.option_group_id = g.id
      ) = 1;

    INSERT INTO menu.product_option_group (
        product_id,
        sort_order,
        kind,
        has_price,
        user_title,
        meta_title,
        description_line,
        required,
        max_select,
        included_in_preview
    )
    SELECT
        p.id,
        1,
        N'multi',
        1,
        N'',
        N'Ekstra lezzetler',
        @marker_multi,
        0,
        3,
        1
    FROM menu.product p
    WHERE EXISTS (
        SELECT 1
        FROM menu.product_option_group g0
        WHERE g0.product_id = p.id
          AND g0.description_line = @marker_portion
    )
      AND NOT EXISTS (
        SELECT 1
        FROM menu.product_option_group gx
        WHERE gx.product_id = p.id
          AND gx.sort_order = 1
      );

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id,
           0,
           N'Ekstra peynir',
           CAST(35.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group g
    WHERE g.description_line = @marker_multi
      AND NOT EXISTS (
          SELECT 1
          FROM menu.product_option_choice c
          WHERE c.option_group_id = g.id
      );

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id,
           1,
           N'Acı sos',
           CAST(10.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group g
    WHERE g.description_line = @marker_multi
      AND (
          SELECT COUNT(*)
          FROM menu.product_option_choice c
          WHERE c.option_group_id = g.id
      ) = 1;

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id,
           2,
           N'Ekstra domates',
           CAST(15.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group g
    WHERE g.description_line = @marker_multi
      AND (
          SELECT COUNT(*)
          FROM menu.product_option_choice c
          WHERE c.option_group_id = g.id
      ) = 2;

    UPDATE menu.product_option_group
    SET description_line = NULL
    WHERE description_line IN (@marker_portion, @marker_multi);
END;
