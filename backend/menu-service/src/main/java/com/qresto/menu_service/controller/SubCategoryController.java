package com.qresto.menu_service.controller;

import com.qresto.menu_service.dto.subcategory.SubCategoryCreateRequest;
import com.qresto.menu_service.dto.subcategory.SubCategoryResponse;
import com.qresto.menu_service.dto.subcategory.SubCategoryUpdateRequest;
import com.qresto.menu_service.service.SubCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/sub-categories")
@RequiredArgsConstructor
public class SubCategoryController {

    private final SubCategoryService subCategoryService;

    @PostMapping
    public ResponseEntity<SubCategoryResponse> create(@Valid @RequestBody SubCategoryCreateRequest request) {
        return ResponseEntity.ok(subCategoryService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subCategoryService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<SubCategoryResponse>> list(@RequestParam(required = false) Long categoryId,
                                                          @RequestParam(defaultValue = "false") boolean onlyActive) {
        if (categoryId != null) {
            return ResponseEntity.ok(subCategoryService.listByCategory(categoryId, onlyActive));
        }
        return ResponseEntity.ok(subCategoryService.listAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubCategoryResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody SubCategoryUpdateRequest request) {
        return ResponseEntity.ok(subCategoryService.update(id, request));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<SubCategoryResponse> setActive(@PathVariable Long id,
                                                         @RequestParam boolean value) {
        return ResponseEntity.ok(subCategoryService.setActive(id, value));
    }
}
