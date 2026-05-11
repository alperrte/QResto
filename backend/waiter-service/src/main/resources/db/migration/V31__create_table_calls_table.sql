CREATE TABLE waiter.table_calls (
                                    id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                    table_id BIGINT NOT NULL,
                                    table_number INT NULL,

                                    call_type NVARCHAR(50) NOT NULL,
                                    status NVARCHAR(50) NOT NULL,
                                    message NVARCHAR(500) NULL,

                                    created_at DATETIME2 NOT NULL,
                                    resolved_at DATETIME2 NULL,
                                    resolved_by NVARCHAR(255) NULL,

                                    is_deleted BIT NOT NULL DEFAULT 0
);