CREATE TABLE users (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       email NVARCHAR(255) NOT NULL,
                       password NVARCHAR(255) NOT NULL,
                       role NVARCHAR(50) NOT NULL,
                       created_at DATETIME2 DEFAULT GETDATE()
);