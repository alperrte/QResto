package com.qresto.menu_service.config;

import com.qresto.menu_service.dto.common.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex,
                                                                   HttpServletRequest request) {
        List<String> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::formatFieldError)
                .toList();

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed")
                .path(request.getRequestURI())
                .details(details)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex,
                                                                        HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .details(List.of())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception ex, HttpServletRequest request) {
        // Cause zincirinden mesajları topla (FK/constraint hataları genelde alttadır).
        List<String> messages = new ArrayList<>();
        Throwable t = ex;
        while (t != null) {
            String m = t.getMessage();
            if (m != null && !m.isBlank()) {
                messages.add(m.trim());
            }
            t = t.getCause();
        }

        // "Unexpected server error" gibi anlamsız mesajları atlayıp en anlamlısını seç.
        String msg = messages.stream()
                .filter(m -> !m.equalsIgnoreCase("Unexpected server error"))
                .findFirst()
                .orElseGet(() -> (ex.getMessage() != null && !ex.getMessage().isBlank())
                        ? ex.getMessage().trim()
                        : ex.getClass().getSimpleName());

        // details: hem mesajları hem de exception class zincirini ver.
        List<String> details = new ArrayList<>();
        details.add(ex.getClass().getSimpleName());
        if (!messages.isEmpty()) {
            details.addAll(messages);
        }
        if (ex.getCause() != null) {
            Throwable c = ex.getCause();
            while (c != null) {
                details.add(c.getClass().getSimpleName());
                c = c.getCause();
            }
        }

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message(msg)
                .path(request.getRequestURI())
                .details(details)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String formatFieldError(FieldError fieldError) {
        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
    }
}
