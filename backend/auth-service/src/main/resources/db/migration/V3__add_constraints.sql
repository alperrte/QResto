-- email unique
ALTER TABLE users
    ADD CONSTRAINT uq_users_email UNIQUE (email);

-- foreign key
ALTER TABLE refresh_tokens
    ADD CONSTRAINT fk_refresh_user
        FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE;