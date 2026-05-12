/*
 * V26 — V23 demo menü ürünleri (12 adet) için opsiyon grupları; Mercimek’te sipariş notu kapalı.
 * Şema: V24 (product_option_group / product_option_choice, order_note kolonları).
 * Tüm price_delta: CAST(... AS DECIMAL(10,2)); ücretsiz = 0.
 * kind: N'portion' | N'single' | N'multi' (V24 CHECK).
 */
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = N'menu' AND TABLE_NAME = N'product_option_group'
)
AND EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = N'menu' AND TABLE_NAME = N'product_option_choice'
)
BEGIN

    /* --- V23 seed: Mercimek hariç 11 ürün --- */

    /* --- Çıtır Patates: seçenekleri yenile + taban fiyat artışı --- */
    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates'
      AND c.name = N'Başlangıçlar';

    UPDATE p
    SET p.price = CAST(135.00 AS DECIMAL(10, 2))
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates'
      AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Porsiyon', NULL, 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Standart (250 g)', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 0 AND g.kind = N'portion';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Büyük (400 g)', CAST(45.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 0 AND g.kind = N'portion';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'multi', 1, N'', N'Soslar', NULL, 0, 4, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Sarımsaklı mayonez', CAST(8 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 1 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Acı sos', CAST(5 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 1 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Ranch sos', CAST(8 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 1 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 3, N'Barbekü sos', CAST(12 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 1 AND g.kind = N'multi';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'portion', 1, N'', N'Kesim şekli', NULL, 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Klasik', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 2 AND g.kind = N'portion';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Elma dilim', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 2 AND g.kind = N'portion';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Tırtıklı', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 2 AND g.kind = N'portion';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 3, N'multi', 1, N'', N'Üzerine', NULL, 0, 3, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Rendelenmiş kaşar', CAST(8 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 3 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Parmesan', CAST(12 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 3 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Cheddar', CAST(10 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Çıtır Patates' AND c.name = N'Başlangıçlar' AND g.sort_order = 3 AND g.kind = N'multi';

    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza'
      AND c.name = N'Pizzalar';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Boyut', N'Pizza çapı', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Küçük (26 cm)', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Orta (32 cm)', CAST(45 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Büyük (40 cm)', CAST(90 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 1, N'', N'Hamur', N'Bir seçim', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Klasik hamur', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'İnce hamur', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Kalın kenarlı (dolgulu)', CAST(35 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Ekstra malzeme', N'En fazla 4 seçim', 0, 4, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Ekstra mozzarella', CAST(40 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Siyah zeytin', CAST(25 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Mantar', CAST(30 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 3, N'Kavrulmuş sarımsak', CAST(15 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 3);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 3, N'single', 1, N'', N'Sarımsaklı kenar', N'Kenar yağı', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 3);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Hayır', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 3 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Evet (+sarımsaklı yağ)', CAST(10 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 3 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 4, N'multi', 0, N'', N'Çıkarılacak malzemeler', N'İstemezseniz işaretleyin', 0, 6, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 4);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Mozzarella', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Domates sosu', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Sarımsak', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 3, N'Kekik', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Margarita Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 3);

    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza'
      AND c.name = N'Pizzalar';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Boyut', N'Pizza çapı', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Küçük (26 cm)', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Orta (32 cm)', CAST(45 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Büyük (40 cm)', CAST(90 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 1, N'', N'Hamur', N'Bir seçim', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Klasik hamur', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'İnce hamur', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Kalın kenarlı (dolgulu)', CAST(35 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Ekstra malzeme', N'En fazla 4 seçim', 0, 4, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Ekstra kaşar mix', CAST(35 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Jalapeno dilimi', CAST(12 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Mısır taneleri', CAST(10 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 3, N'Kırmızı soğan marine', CAST(8 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 3);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 3, N'single', 1, N'', N'Sarımsaklı kenar', N'Kenar yağı', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 3);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Hayır', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 3 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Evet (+sarımsaklı yağ)', CAST(10 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 3 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 4, N'multi', 0, N'', N'Çıkarılacak malzemeler', N'İstemezseniz işaretleyin', 0, 6, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 4);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Mozzarella', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Sucuk', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Salam', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 3, N'Biber', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 3);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 4, N'Zeytin', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 4);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 5, N'Domates sosu', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Karışık Pizza' AND c.name = N'Pizzalar' AND g.sort_order = 4 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 5);

    UPDATE p
    SET
        p.order_note_enabled = 1,
        p.order_note_title = N'Sipariş notu'
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE c.name = N'Burgerler'
      AND p.name IN (N'Klasik Burger', N'Acılı Tavuk Burger');

    /* --- Izgara Tavuk: porsiyon + eklenebilen soslar (multi) + pişirme; sipariş notu açık --- */
    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk'
      AND c.name = N'Ana Yemekler';

    UPDATE p
    SET
        p.gram = 200,
        p.order_note_enabled = 1,
        p.order_note_title = N'Sipariş notu'
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk'
      AND c.name = N'Ana Yemekler';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Porsiyon', N'Et miktarı', 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Standart (200 g)', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler' AND g.sort_order = 0 AND g.kind = N'portion';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Büyük (300 g)', CAST(55.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler' AND g.sort_order = 0 AND g.kind = N'portion';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'multi', 1, N'', N'Eklenebilen soslar', N'En fazla 2 seçim', 0, 2, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Barbekü sos', CAST(10.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler' AND g.sort_order = 1 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Köri sos', CAST(10.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler' AND g.sort_order = 1 AND g.kind = N'multi';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'single', 1, N'', N'Pişirme derecesi', NULL, 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Az', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler' AND g.sort_order = 2 AND g.kind = N'single';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Orta', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler' AND g.sort_order = 2 AND g.kind = N'single';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Çok', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Izgara Tavuk' AND c.name = N'Ana Yemekler' AND g.sort_order = 2 AND g.kind = N'single';

    /* --- Et Pirzola: fiyat/gram + porsiyon + pişirme + steak sosları; sipariş notu kapalı --- */
    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola'
      AND c.name = N'Ana Yemekler';

    UPDATE p
    SET
        p.price = CAST(495.00 AS DECIMAL(10, 2)),
        p.gram = 350,
        p.order_note_enabled = 0,
        p.order_note_title = NULL
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola'
      AND c.name = N'Ana Yemekler';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Porsiyon', NULL, 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'350 g (3 parça)', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler' AND g.sort_order = 0 AND g.kind = N'portion';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'450 g (4 parça)', CAST(120.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler' AND g.sort_order = 0 AND g.kind = N'portion';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 1, N'', N'Pişirme derecesi', N'Et iç sıcaklığı', 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Orta', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler' AND g.sort_order = 1 AND g.kind = N'single';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Az pişmiş', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler' AND g.sort_order = 1 AND g.kind = N'single';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'İyi pişmiş', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler' AND g.sort_order = 1 AND g.kind = N'single';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Steak sosları', N'En fazla 2 seçim', 0, 2, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Bernaise sos', CAST(25.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler' AND g.sort_order = 2 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Biberiye tereyağı', CAST(15.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler' AND g.sort_order = 2 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Mantar demi-glace', CAST(20.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Et Pirzola' AND c.name = N'Ana Yemekler' AND g.sort_order = 2 AND g.kind = N'multi';

    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger'
      AND c.name = N'Burgerler';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Köfte', N'Kat sayısı', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Tek köfte', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Çift köfte', CAST(75 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 1, N'', N'Pişirme', N'Köfte iç', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'İyi pişmiş', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Orta (pembe iç)', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Az pişmiş', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Ekstralar', N'En fazla 4', 0, 4, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Ekstra cheddar dilimi', CAST(30 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Bacon (3 dilim)', CAST(45 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Karamelize soğan', CAST(20 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 3, N'Jalapeno dilimleri', CAST(12 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 3);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 3, N'single', 1, N'', N'Ekmek', N'Üst / alt bun', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 3);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Susamlı brioche', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 3 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Klasik burger ekmeği', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Klasik Burger' AND c.name = N'Burgerler' AND g.sort_order = 3 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger'
      AND c.name = N'Burgerler';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Fileto', N'Tavuk miktarı', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Tek çıtır fileto', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Çift fileto', CAST(55 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 1, N'', N'Acı seviyesi', N'Sos yoğunluğu', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Orta acı', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Hafif acı', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Ekstra acı', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Ekstra & çıtır', N'En fazla 3', 0, 3, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Coleslaw (yan)', CAST(12 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Çıtır soğan halkası', CAST(18 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Ekstra acı sos', CAST(5 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Acılı Tavuk Burger' AND c.name = N'Burgerler' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Porsiyon', N'Dilim adedi', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Tek dilim', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Çift dilim (+1 dilim)', CAST(75 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar' AND g.sort_order = 0 AND g.kind = N'portion'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 1, N'', N'Servis', N'Paket veya tabak', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Tabakta servis', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Kutuda paket', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Üst sos & serpiş', N'En fazla 3', 0, 3, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Ekstra vişne sosu', CAST(10 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Karamel drizzle', CAST(15 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Badem fileto', CAST(20 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Vişneli Cheesecake' AND c.name = N'Tatlılar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'single', 1, N'', N'Sufle boyutu', N'Porsiyon', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Standart kase', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar' AND g.sort_order = 0 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Büyük sufle kasesi', CAST(25 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar' AND g.sort_order = 0 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 1, N'', N'Dondurma topları', N'Yanında', 1, 1, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Vanilya (1 top)', CAST(25 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Bitter çikolata (1 top)', CAST(30 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Dondurmasız', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar' AND g.sort_order = 1 AND g.kind = N'single'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Son dokunuş', N'En fazla 2', 0, 2, 1
    FROM menu.product p INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_group gx WHERE gx.product_id = p.id AND gx.sort_order = 2);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Pudra şekeri', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 0);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Çikolata sos gezdirme', CAST(8 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 1);

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Fındık kırığı', CAST(12 AS DECIMAL(10, 2))
    FROM menu.product_option_group g INNER JOIN menu.product p ON p.id = g.product_id INNER JOIN menu.category c ON c.id = p.category_id
    WHERE p.name = N'Sufle' AND c.name = N'Tatlılar' AND g.sort_order = 2 AND g.kind = N'multi'
      AND NOT EXISTS (SELECT 1 FROM menu.product_option_choice cx WHERE cx.option_group_id = g.id AND cx.sort_order = 2);

    /* --- Ev Yapımı Limonata: Boyut (Normal / 1 L sürahi +fiyat), Buzlu-Buzsuz, aroma; gram/prep yok --- */
    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata'
      AND c.name = N'İçecekler';

    UPDATE p
    SET
        p.gram = NULL,
        p.prep_time_min = NULL
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata'
      AND c.name = N'İçecekler';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'portion', 1, N'', N'Boyut', NULL, 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Normal (330 ml)', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler' AND g.sort_order = 0 AND g.kind = N'portion';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'1 L Sürahi', CAST(35 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler' AND g.sort_order = 0 AND g.kind = N'portion';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 0, N'', N'Buz', NULL, 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Buzlu', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler' AND g.sort_order = 1 AND g.kind = N'single';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Buzsuz', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler' AND g.sort_order = 1 AND g.kind = N'single';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Aroma', N'Nane / zencefil', 0, 3, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Taze nane dalı', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler' AND g.sort_order = 2 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Zencefil dilimi', CAST(5 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler' AND g.sort_order = 2 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Mine çiçeği (hibiskus) shot', CAST(10 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Ev Yapımı Limonata' AND c.name = N'İçecekler' AND g.sort_order = 2 AND g.kind = N'multi';

    /* --- Soğuk Kahve: Orta/Büyük, süt, üzerine (krema / çikolata / tarçın); gram/prep yok --- */
    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve'
      AND c.name = N'İçecekler';

    UPDATE p
    SET
        p.gram = NULL,
        p.prep_time_min = NULL
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve'
      AND c.name = N'İçecekler';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 0, N'single', 1, N'', N'Boy', NULL, 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Orta', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler' AND g.sort_order = 0 AND g.kind = N'single';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Büyük', CAST(35 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler' AND g.sort_order = 0 AND g.kind = N'single';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 1, N'single', 1, N'', N'Süt seçimi', NULL, 1, 1, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Tam yağlı süt', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler' AND g.sort_order = 1 AND g.kind = N'single';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Yağsız süt', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler' AND g.sort_order = 1 AND g.kind = N'single';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Badem sütü', CAST(25 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler' AND g.sort_order = 1 AND g.kind = N'single';

    INSERT INTO menu.product_option_group (product_id, sort_order, kind, has_price, user_title, meta_title, description_line, required, max_select, included_in_preview)
    SELECT p.id, 2, N'multi', 1, N'', N'Üzerine', N'İsteğe bağlı', 0, 3, 1
    FROM menu.product AS p INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Krema', CAST(12 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler' AND g.sort_order = 2 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Çikolata sos', CAST(10 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler' AND g.sort_order = 2 AND g.kind = N'multi';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 2, N'Tarçın serpme', CAST(5 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g INNER JOIN menu.product AS p ON p.id = g.product_id INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Soğuk Kahve' AND c.name = N'İçecekler' AND g.sort_order = 2 AND g.kind = N'multi';

    /* Mercimek Çorbası — fiyat/süre/kalori/gram + 3 opsiyon; sipariş notu kapalı */
    DELETE g
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar';

    UPDATE p
    SET
        p.price = CAST(195.00 AS DECIMAL(10, 2)),
        p.prep_time_min = 15,
        p.calorie = 180,
        p.gram = NULL,
        p.order_note_enabled = 0,
        p.order_note_title = NULL
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_group (
        product_id, sort_order, kind, has_price, user_title, meta_title, description_line,
        required, max_select, included_in_preview
    )
    SELECT p.id, 0, N'portion', 1, N'', N'Porsiyon', NULL, 1, 1, 1
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'350 ml', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar'
      AND g.sort_order = 0;

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'500 ml', CAST(50.00 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar'
      AND g.sort_order = 0;

    INSERT INTO menu.product_option_group (
        product_id, sort_order, kind, has_price, user_title, meta_title, description_line,
        required, max_select, included_in_preview
    )
    SELECT p.id, 1, N'multi', 1, N'', N'Ek Tercihler', NULL, 0, 2, 1
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Tereyağlı sos', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar'
      AND g.sort_order = 1;

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Limon', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar'
      AND g.sort_order = 1;

    INSERT INTO menu.product_option_group (
        product_id, sort_order, kind, has_price, user_title, meta_title, description_line,
        required, max_select, included_in_preview
    )
    SELECT p.id, 2, N'single', 1, N'', N'Servis', NULL, 1, 1, 1
    FROM menu.product AS p
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar';

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 0, N'Acılı', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar'
      AND g.sort_order = 2;

    INSERT INTO menu.product_option_choice (option_group_id, sort_order, label, price_delta)
    SELECT g.id, 1, N'Acısız', CAST(0 AS DECIMAL(10, 2))
    FROM menu.product_option_group AS g
    INNER JOIN menu.product AS p ON p.id = g.product_id
    INNER JOIN menu.category AS c ON c.id = p.category_id
    WHERE p.name = N'Mercimek Çorbası'
      AND c.name = N'Başlangıçlar'
      AND g.sort_order = 2;
END;
