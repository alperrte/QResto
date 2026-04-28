package com.qresto.menu_service.repository;

import com.qresto.menu_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    List<Product> findBySubCategoryIdAndActiveTrue(Long subCategoryId);

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword);

    List<Product> findByInStockFalseAndActiveTrue();

    List<Product> findByCategoryIdAndInStockTrueAndActiveTrue(Long categoryId);

    List<Product> findBySubCategoryIdAndInStockTrueAndActiveTrue(Long subCategoryId);
}
