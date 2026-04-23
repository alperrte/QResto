CREATE TABLE refresh_tokens (
                                id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                token NVARCHAR(MAX) NOT NULL,
                                expiry_date DATETIME2 NOT NULL,
                                revoked BIT NOT NULL DEFAULT 0,
                                user_id BIGINT NOT NULL,
                                created_at DATETIME2 DEFAULT GETDATE()
);