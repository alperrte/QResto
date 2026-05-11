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

    @Value("${DEFAULT_WAITER_EMAIL}")
    private String waiterEmail;

    @Value("${DEFAULT_WAITER_PASSWORD}")
    private String waiterPassword;

    @Value("${DEFAULT_KITCHEN_EMAIL}")
    private String kitchenEmail;

    @Value("${DEFAULT_KITCHEN_PASSWORD}")
    private String kitchenPassword;

    @Override
    public void run(String... args) {

        createDefaultUser(adminEmail, adminPassword, Role.ADMIN);
        createDefaultUser(waiterEmail, waiterPassword, Role.WAITER);
        createDefaultUser(kitchenEmail, kitchenPassword, Role.KITCHEN);
    }

    private void createDefaultUser(String email, String password, Role role) {

        boolean exists = userRepository.existsByEmail(email);

        if (!exists) {

            User user = new User();

            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);

            userRepository.save(user);

            System.out.println("✅ Default " + role + " user created: " + email);
        }
    }
}