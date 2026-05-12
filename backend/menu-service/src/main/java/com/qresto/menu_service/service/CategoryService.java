package com.qresto.menu_service.service;

import com.qresto.menu_service.dto.category.CategoryCreateRequest;
import com.qresto.menu_service.dto.category.CategoryResponse;
import com.qresto.menu_service.dto.category.CategoryUpdateRequest;
import com.qresto.menu_service.entity.Category;
import com.qresto.menu_service.entity.SubCategory;
import com.qresto.menu_service.repository.CategoryRepository;
import com.qresto.menu_service.repository.ProductRepository;
import com.qresto.menu_service.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SubCategoryRepository subCategoryRepository;

    public CategoryResponse create(CategoryCreateRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new IllegalArgumentException("Category name already exists");
        }

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setActive(true);

        return toResponse(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));
        return toResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listActive() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse update(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));

        String newName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(newName, id)) {
            throw new IllegalArgumentException("Category name already exists");
        }

        category.setName(newName);
        category.setActive(request.getActive());
        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse setActive(Long id, boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));
        category.setActive(active);
        return toResponse(categoryRepository.save(category));
    }

    /**
     * Alt kategorileri ve ürün alt kategori bağlarını temizler; ürünlerin kategori_id değeri
     * veritabanı ON DELETE SET NULL ile kategorisiz kalır.
     */
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));

        // Kategori silmeden önce ürünlerdeki category bağını NULL'la.
        // Böylece ON DELETE davranışı DB'de beklenmedik şekilde kısıtlıysa bile silme çalışır.
        productRepository.clearCategoryForCategoryId(id);

        List<Long> subIds = subCategoryRepository.findByCategoryId(id).stream()
                .map(SubCategory::getId)
                .toList();
        if (!subIds.isEmpty()) {
            productRepository.clearSubCategoryForSubCategoryIds(subIds);
            subCategoryRepository.deleteAllById(subIds);
        }
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setActive(category.getActive());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }
}
