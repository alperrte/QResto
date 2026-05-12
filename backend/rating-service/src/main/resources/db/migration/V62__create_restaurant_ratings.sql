CREATE TABLE restaurant_ratings (
                                    id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                    order_id BIGINT NOT NULL,

                                    table_session_id BIGINT NOT NULL,
                                    guest_session_id BIGINT NOT NULL,
                                    table_id BIGINT NOT NULL,
                                    table_name NVARCHAR(100) NULL,

                                    rating INT NOT NULL,
                                    comment NVARCHAR(1000) NULL,

                                    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                    updated_at DATETIME2 NULL,

                                    CONSTRAINT ck_restaurant_ratings_rating
                                        CHECK (rating BETWEEN 1 AND 5),

                                    CONSTRAINT uq_restaurant_ratings_order_guest
                                        UNIQUE (order_id, guest_session_id)
);