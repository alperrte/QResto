CREATE TABLE kitchen.kitchen_orders (
                                        id BIGINT PRIMARY KEY IDENTITY(1,1),

                                        order_id BIGINT NOT NULL,

                                        table_number INT NOT NULL,

                                        status VARCHAR(50) NOT NULL,

                                        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

                                        updated_at DATETIME2
);