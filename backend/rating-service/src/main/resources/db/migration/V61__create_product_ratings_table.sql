CREATE TABLE product_ratings (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                 order_id BIGINT NOT NULL,
                                 order_item_id BIGINT NOT NULL,
                                 product_id BIGINT NOT NULL,

                                 table_session_id BIGINT NOT NULL,
                                 guest_session_id BIGINT NOT NULL,
                                 table_id BIGINT NOT NULL,
                                 table_name NVARCHAR(100) NULL,

                                 rating INT NOT NULL,
                                 comment NVARCHAR(1000) NULL,

                                 created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                 updated_at DATETIME2 NULL,

                                 CONSTRAINT ck_product_ratings_rating
                                     CHECK (rating BETWEEN 1 AND 5),

                                 CONSTRAINT uq_product_ratings_order_item_guest
                                     UNIQUE (order_id, order_item_id, guest_session_id)
);