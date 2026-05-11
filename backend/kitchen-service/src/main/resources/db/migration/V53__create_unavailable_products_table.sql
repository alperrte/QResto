CREATE TABLE kitchen.unavailable_products (
                                              id BIGINT PRIMARY KEY IDENTITY(1,1),

                                              product_id BIGINT NOT NULL,

                                              product_name VARCHAR(255) NOT NULL,

                                              reason VARCHAR(500),

                                              is_active BIT NOT NULL DEFAULT 1,

                                              created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
