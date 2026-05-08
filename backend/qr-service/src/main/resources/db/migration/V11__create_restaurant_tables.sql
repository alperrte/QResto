CREATE TABLE restaurant_tables (
                                   id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                   name NVARCHAR(100) NOT NULL,
                                   capacity INT NULL,
                                   active BIT NOT NULL DEFAULT 1,
                                   created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                   updated_at DATETIME2 NULL
);