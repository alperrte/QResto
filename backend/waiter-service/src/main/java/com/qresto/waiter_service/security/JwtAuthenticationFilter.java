package com.qresto.waiter_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // OPTIONS istekleri CORS preflight olabilir, JWT kontrolüne sokmayalım
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        System.out.println("WAITER AUTH URI = " + request.getRequestURI());
        System.out.println("WAITER AUTH HEADER = " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("WAITER AUTH HEADER YOK VEYA BEARER DEĞİL");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isBlank()) {
            System.out.println("WAITER TOKEN BOŞ");
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtService.isTokenValid(token)) {
            System.out.println("WAITER SECURITY: Token geçersiz");
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);

        System.out.println("WAITER SECURITY EMAIL = " + email);
        System.out.println("WAITER SECURITY ROLE = " + role);

        if (email == null || email.isBlank() || role == null || role.isBlank()) {
            System.out.println("WAITER SECURITY: Email veya role claim boş");
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {

            String normalizedRole = role.trim().toUpperCase();
            String authority = normalizedRole.startsWith("ROLE_")
                    ? normalizedRole
                    : "ROLE_" + normalizedRole;

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority(authority))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("WAITER SECURITY AUTHORITY = " + authority);
            System.out.println("WAITER SECURITY AUTH SET EDİLDİ");
        }

        filterChain.doFilter(request, response);
    }
}