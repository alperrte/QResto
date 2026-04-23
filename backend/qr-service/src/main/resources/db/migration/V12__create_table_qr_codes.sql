CREATE TABLE table_qr_codes (
                                id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                table_id BIGINT NOT NULL,
                                qr_uuid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
                                qr_token NVARCHAR(255) NOT NULL UNIQUE,
                                qr_image_url NVARCHAR(500) NULL,
                                version_no INT NOT NULL DEFAULT 1,
                                active BIT NOT NULL DEFAULT 1,
                                created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                updated_at DATETIME2 NULL,

                                CONSTRAINT FK_table_qr_codes_table
                                    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id)
);