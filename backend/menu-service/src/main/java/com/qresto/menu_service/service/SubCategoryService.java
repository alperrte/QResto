package com.qresto.menu_service.service;

import com.qresto.menu_service.dto.subcategory.SubCategoryCreateRequest;
import com.qresto.menu_service.dto.subcategory.SubCategoryResponse;
import com.qresto.menu_service.dto.subcategory.SubCategoryUpdateRequest;
import com.qresto.menu_service.entity.Category;
import com.qresto.menu_service.entity.SubCategory;
import com.qresto.menu_service.repository.CategoryRepository;
import com.qresto.menu_service.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;

    public SubCategoryResponse create(SubCategoryCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.getCategoryId()));

        String subCategoryName = request.getName().trim();
        if (subCategoryRepository.existsByCategoryIdAndNameIgnoreCase(category.getId(), subCategoryName)) {
            throw new IllegalArgumentException("Sub category name already exists in this category");
        }

        SubCategory subCategory = new SubCategory();
        subCategory.setCategory(category);
        subCategory.setName(subCategoryName);
        subCategory.setActive(true);

        return toResponse(subCategoryRepository.save(subCategory));
    }

    @Transactional(readOnly = true)
    public SubCategoryResponse getById(Long id) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sub category not found: " + id));
        return toResponse(subCategory);
    }

    @Transactional(readOnly = true)
    public List<SubCategoryResponse> listAll() {
        return subCategoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubCategoryResponse> listByCategory(Long categoryId, boolean onlyActive) {
        List<SubCategory> subCategories = onlyActive
                ? subCategoryRepository.findByCategoryIdAndActiveTrue(categoryId)
                : subCategoryRepository.findByCategoryId(categoryId);

        return subCategories.stream()
                .map(this::toResponse)
                .toList();
    }

    public SubCategoryResponse update(Long id, SubCategoryUpdateRequest request) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sub category not found: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.getCategoryId()));

        String subCategoryName = request.getName().trim();
        if (subCategoryRepository.existsByCategoryIdAndNameIgnoreCaseAndIdNot(category.getId(), subCategoryName, id)) {
            throw new IllegalArgumentException("Sub category name already exists in this category");
        }

        subCategory.setCategory(category);
        subCategory.setName(subCategoryName);
        subCategory.setActive(request.getActive());
        return toResponse(subCategoryRepository.save(subCategory));
    }

    public SubCategoryResponse setActive(Long id, boolean active) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sub category not found: " + id));
        subCategory.setActive(active);
        return toResponse(subCategoryRepository.save(subCategory));
    }

    private SubCategoryResponse toResponse(SubCategory subCategory) {
        SubCategoryResponse response = new SubCategoryResponse();
        response.setId(subCategory.getId());
        response.setCategoryId(subCategory.getCategory().getId());
        response.setName(subCategory.getName());
        response.setActive(subCategory.getActive());
        response.setCreatedAt(subCategory.getCreatedAt());
        response.setUpdatedAt(subCategory.getUpdatedAt());
        return response;
    }
}
