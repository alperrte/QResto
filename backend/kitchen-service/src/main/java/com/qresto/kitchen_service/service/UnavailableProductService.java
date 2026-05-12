package com.qresto.kitchen_service.service;

import com.qresto.kitchen_service.dto.request.CreateUnavailableProductRequest;
import com.qresto.kitchen_service.entity.UnavailableProduct;
import com.qresto.kitchen_service.repository.UnavailableProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.qresto.kitchen_service.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UnavailableProductService {

    private final UnavailableProductRepository unavailableProductRepository;

    public List<UnavailableProduct> getUnavailableProducts() {
        return unavailableProductRepository.findByIsActiveTrue();
    }

    public UnavailableProduct createUnavailableProduct(
            CreateUnavailableProductRequest request
    ) {

        UnavailableProduct unavailableProduct = new UnavailableProduct();

        unavailableProduct.setProductId(request.getProductId());
        unavailableProduct.setProductName(request.getProductName());
        unavailableProduct.setReason(request.getReason());

        unavailableProduct.setIsActive(true);
        unavailableProduct.setCreatedAt(LocalDateTime.now());

        return unavailableProductRepository.save(unavailableProduct);
    }

    public UnavailableProduct activateProduct(Long id) {

        UnavailableProduct unavailableProduct = unavailableProductRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ürün bulunamadı")
                );

        unavailableProduct.setIsActive(false);

        return unavailableProductRepository.save(unavailableProduct);
    }

}