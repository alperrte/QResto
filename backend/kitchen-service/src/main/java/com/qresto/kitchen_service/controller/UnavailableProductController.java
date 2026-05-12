package com.qresto.kitchen_service.controller;

import com.qresto.kitchen_service.dto.request.CreateUnavailableProductRequest;
import com.qresto.kitchen_service.entity.UnavailableProduct;
import com.qresto.kitchen_service.service.UnavailableProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen/unavailable-products")
@RequiredArgsConstructor
public class UnavailableProductController {

    private final UnavailableProductService unavailableProductService;

    @GetMapping
    public List<UnavailableProduct> getUnavailableProducts() {
        return unavailableProductService.getUnavailableProducts();
    }

    @PostMapping
    public UnavailableProduct createUnavailableProduct(
            @Valid @RequestBody CreateUnavailableProductRequest request
    ) {
        return unavailableProductService.createUnavailableProduct(request);
    }

    @PatchMapping("/{id}/activate")
    public UnavailableProduct activateProduct(
            @PathVariable Long id
    ) {
        return unavailableProductService.activateProduct(id);
    }

}