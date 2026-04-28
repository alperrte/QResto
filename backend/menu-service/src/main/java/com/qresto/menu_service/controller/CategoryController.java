package com.qresto.menu_service.controller;

import com.qresto.menu_service.dto.category.CategoryCreateRequest;
import com.qresto.menu_service.dto.category.CategoryResponse;
import com.qresto.menu_service.dto.category.CategoryUpdateRequest;
import com.qresto.menu_service.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryCreateRequest request) {
        return ResponseEntity.ok(categoryService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> list(@RequestParam(defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(onlyActive ? categoryService.listActive() : categoryService.listAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody CategoryUpdateRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<CategoryResponse> setActive(@PathVariable Long id,
                                                      @RequestParam boolean value) {
        return ResponseEntity.ok(categoryService.setActive(id, value));
    }
}
