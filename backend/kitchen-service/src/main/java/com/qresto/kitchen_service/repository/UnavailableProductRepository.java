package com.qresto.kitchen_service.repository;

import com.qresto.kitchen_service.entity.UnavailableProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UnavailableProductRepository extends JpaRepository<UnavailableProduct, Long> {

    List<UnavailableProduct> findByIsActiveTrue();

}