CREATE TABLE guest_sessions (
                                id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                table_session_id BIGINT NOT NULL,

                                guest_code NVARCHAR(100) NOT NULL UNIQUE,
                                device_token NVARCHAR(255) NOT NULL,

                                status NVARCHAR(50) NOT NULL,
                                joined_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                last_activity_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                expired_at DATETIME2 NULL,
                                closed_at DATETIME2 NULL,
                                close_reason NVARCHAR(100) NULL,

                                created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                updated_at DATETIME2 NULL,

                                CONSTRAINT FK_guest_sessions_table_session
                                    FOREIGN KEY (table_session_id) REFERENCES table_sessions(id),

                                CONSTRAINT CHK_guest_sessions_status
                                    CHECK (status IN (
                                                      'ACTIVE',
                                                      'INACTIVE',
                                                      'EXPIRED',
                                                      'CLOSED'
                                        ))
);