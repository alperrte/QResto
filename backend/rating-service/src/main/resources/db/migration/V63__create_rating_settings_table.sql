CREATE TABLE rating_settings (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                 rating_service_enabled BIT NOT NULL DEFAULT 1,
                                 restaurant_ratings_enabled BIT NOT NULL DEFAULT 1,
                                 restaurant_comments_enabled BIT NOT NULL DEFAULT 1,
                                 product_ratings_enabled BIT NOT NULL DEFAULT 1,
                                 product_comments_enabled BIT NOT NULL DEFAULT 1,

                                 created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                 updated_at DATETIME2 NULL
);