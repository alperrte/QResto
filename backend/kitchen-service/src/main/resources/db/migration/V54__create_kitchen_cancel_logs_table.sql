CREATE TABLE kitchen.kitchen_cancel_logs (
                                             id BIGINT PRIMARY KEY IDENTITY(1,1),

                                             kitchen_order_id BIGINT NOT NULL,

                                             cancel_reason VARCHAR(500) NOT NULL,

                                             cancelled_by VARCHAR(255),

                                             created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

                                             CONSTRAINT fk_kitchen_cancel_logs_order
                                                 FOREIGN KEY (kitchen_order_id)
                                                     REFERENCES kitchen.kitchen_orders(id)
);