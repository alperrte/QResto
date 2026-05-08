package com.qresto.auth_service.config;

import com.qresto.auth_service.entity.Role;
import com.qresto.auth_service.entity.User;
import com.qresto.auth_service.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${DEFAULT_ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${DEFAULT_ADMIN_PASSWORD}")
    private String adminPassword;

    @Override
    public void run(String... args) {

        boolean exists = userRepository.existsByEmail(adminEmail);

        if (!exists) {

            User admin = new User();

            admin.setEmail(adminEmail);

            admin.setPassword(
                    passwordEncoder.encode(adminPassword)
            );

            admin.setRole(Role.ADMIN);

            userRepository.save(admin);

            System.out.println("✅ Default admin created.");
        }
    }
}