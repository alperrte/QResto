package com.qresto.menu_service.controller;

import com.qresto.menu_service.dto.product.ProductCreateRequest;
import com.qresto.menu_service.dto.product.ProductResponse;
import com.qresto.menu_service.dto.product.ProductUpdateRequest;
import com.qresto.menu_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> list(@RequestParam(required = false) Long categoryId,
                                                      @RequestParam(required = false) Long subCategoryId,
                                                      @RequestParam(defaultValue = "false") boolean onlyActive) {
        if (subCategoryId != null) {
            return ResponseEntity.ok(productService.listBySubCategory(subCategoryId));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(productService.listByCategory(categoryId));
        }
        return ResponseEntity.ok(onlyActive ? productService.listActive() : productService.listAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchActiveProducts(keyword));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ProductResponse> setActive(@PathVariable Long id,
                                                     @RequestParam boolean value) {
        return ResponseEntity.ok(productService.setActive(id, value));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductResponse> setInStock(@PathVariable Long id,
                                                      @RequestParam boolean value) {
        return ResponseEntity.ok(productService.setInStock(id, value));
    }
}
