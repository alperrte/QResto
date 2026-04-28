CREATE TABLE table_sessions (
                                id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                table_id BIGINT NOT NULL,
                                qr_code_id BIGINT NULL,

                                session_code NVARCHAR(100) NOT NULL UNIQUE,

                                status NVARCHAR(50) NOT NULL,
                                started_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                last_activity_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                closed_at DATETIME2 NULL,
                                close_reason NVARCHAR(100) NULL,

                                created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                updated_at DATETIME2 NULL,

                                CONSTRAINT FK_table_sessions_table
                                    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),

                                CONSTRAINT FK_table_sessions_qr
                                    FOREIGN KEY (qr_code_id) REFERENCES table_qr_codes(id),

                                CONSTRAINT CHK_table_sessions_status
                                    CHECK (status IN (
                                                      'ACTIVE',
                                                      'ORDERED',
                                                      'PAYMENT_PENDING',
                                                      'COMPLETED',
                                                      'CANCELLED',
                                                      'EXPIRED',
                                                      'CLOSED_BY_WAITER',
                                                      'CLOSED_BY_ADMIN'
                                        ))
);