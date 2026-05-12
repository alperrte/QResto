package com.qresto.menu_service.repository;

import com.qresto.menu_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    /**
     * Müşteri menüsü için görünür ürünler:
     * - product.active = true
     * - (product.category.active = true OR product.category IS NULL)
     */
    @Query("""
        select p
        from Product p
        where p.active = true
          and (p.category is null or p.category.active = true)
    """)
    List<Product> findCustomerVisibleActiveProducts();

    /**
     * Belirli kategori altında görünür ürünler (kategori pasifse boş döner).
     */
    @Query("""
        select p
        from Product p
        where p.active = true
          and p.category.id = :categoryId
          and p.category.active = true
    """)
    List<Product> findCustomerVisibleActiveProductsByCategory(@Param("categoryId") Long categoryId);

    @Query("""
        select p
        from Product p
        where p.active = true
          and p.subCategory.id = :subCategoryId
          and p.subCategory.category.active = true
    """)
    List<Product> findCustomerVisibleActiveProductsBySubCategory(@Param("subCategoryId") Long subCategoryId);

    @Query("""
        select p
        from Product p
        where p.active = true
          and lower(p.name) like lower(concat('%', :keyword, '%'))
          and (p.category is null or p.category.active = true)
    """)
    List<Product> searchCustomerVisibleActiveProducts(@Param("keyword") String keyword);

    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    List<Product> findBySubCategoryIdAndActiveTrue(Long subCategoryId);

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String keyword);

    List<Product> findByInStockFalseAndActiveTrue();

    List<Product> findByCategoryIdAndInStockTrueAndActiveTrue(Long categoryId);

    List<Product> findBySubCategoryIdAndInStockTrueAndActiveTrue(Long subCategoryId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE Product p SET p.subCategory = null WHERE p.subCategory IS NOT NULL AND p.subCategory.id IN :ids")
    void clearSubCategoryForSubCategoryIds(@Param("ids") List<Long> ids);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE Product p SET p.category = null WHERE p.category IS NOT NULL AND p.category.id = :categoryId")
    void clearCategoryForCategoryId(@Param("categoryId") Long categoryId);
}
