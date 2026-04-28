package com.qresto.menu_service.repository;

import com.qresto.menu_service.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {

    List<SubCategory> findByCategoryId(Long categoryId);

    List<SubCategory> findByCategoryIdAndActiveTrue(Long categoryId);

    List<SubCategory> findByActiveTrue();

    Optional<SubCategory> findByIdAndCategoryId(Long id, Long categoryId);

    boolean existsByCategoryIdAndNameIgnoreCase(Long categoryId, String name);

    boolean existsByCategoryIdAndNameIgnoreCaseAndIdNot(Long categoryId, String name, Long id);
}
