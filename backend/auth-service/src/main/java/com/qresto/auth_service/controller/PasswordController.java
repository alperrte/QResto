package com.qresto.auth_service.controller;

import com.qresto.auth_service.dto.request.ChangePasswordRequest;
import com.qresto.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/password")
@RequiredArgsConstructor
public class PasswordController {

    private final AuthService authService;

    @PostMapping("/change")
    public String changePassword(@RequestBody ChangePasswordRequest request) {
        authService.changePassword(
                request.getEmail(),
                request.getOldPassword(),
                request.getNewPassword()
        );
        return "Password changed";
    }
}