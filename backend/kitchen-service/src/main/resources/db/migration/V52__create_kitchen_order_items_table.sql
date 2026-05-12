CREATE TABLE kitchen.kitchen_order_items (
                                             id BIGINT PRIMARY KEY IDENTITY(1,1),

                                             kitchen_order_id BIGINT NOT NULL,

                                             product_id BIGINT NOT NULL,

                                             product_name VARCHAR(255) NOT NULL,

                                             quantity INT NOT NULL,

                                             note VARCHAR(500),

                                             status VARCHAR(50) NOT NULL,

                                             created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

                                             CONSTRAINT fk_kitchen_order_items_order
                                                 FOREIGN KEY (kitchen_order_id)
                                                     REFERENCES kitchen.kitchen_orders(id)
);