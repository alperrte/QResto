package com.qresto.menu_service.service;

import com.qresto.menu_service.dto.product.ProductCreateRequest;
import com.qresto.menu_service.dto.product.ProductResponse;
import com.qresto.menu_service.dto.product.ProductUpdateRequest;
import com.qresto.menu_service.entity.Category;
import com.qresto.menu_service.entity.Product;
import com.qresto.menu_service.entity.SubCategory;
import com.qresto.menu_service.repository.CategoryRepository;
import com.qresto.menu_service.repository.ProductRepository;
import com.qresto.menu_service.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.qresto.menu_service.dto.product.ProductOrderInfoResponse;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public ProductResponse create(ProductCreateRequest request) {
        Category category = findCategory(request.getCategoryId());
        SubCategory subCategory = findSubCategoryIfPresent(request.getSubCategoryId());
        validateSubCategoryCategoryMatch(category, subCategory);

        Product product = new Product();
        product.setCategory(category);
        product.setSubCategory(subCategory);
        applyCreateFields(product, request);

        return toResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listAll() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listActive() {
        return productRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listBySubCategory(Long subCategoryId) {
        return productRepository.findBySubCategoryIdAndActiveTrue(subCategoryId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchActiveProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(keyword.trim()).stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse update(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        Category category = findCategory(request.getCategoryId());
        SubCategory subCategory = findSubCategoryIfPresent(request.getSubCategoryId());
        validateSubCategoryCategoryMatch(category, subCategory);

        product.setCategory(category);
        product.setSubCategory(subCategory);
        applyUpdateFields(product, request);

        return toResponse(productRepository.save(product));
    }

    public ProductResponse setActive(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        product.setActive(active);
        return toResponse(productRepository.save(product));
    }

    public ProductResponse setInStock(Long id, boolean inStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        product.setInStock(inStock);
        return toResponse(productRepository.save(product));
    }

    private Category findCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId));
    }

    private SubCategory findSubCategoryIfPresent(Long subCategoryId) {
        if (subCategoryId == null) {
            return null;
        }
        return subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new IllegalArgumentException("Sub category not found: " + subCategoryId));
    }

    private void validateSubCategoryCategoryMatch(Category category, SubCategory subCategory) {
        if (subCategory != null && !subCategory.getCategory().getId().equals(category.getId())) {
            throw new IllegalArgumentException("Sub category does not belong to the selected category");
        }
    }

    private void applyCreateFields(Product product, ProductCreateRequest request) {
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setVatIncluded(request.getVatIncluded() == null ? Boolean.TRUE : request.getVatIncluded());
        product.setIngredients(request.getIngredients());
        product.setRemovableIngredients(request.getRemovableIngredients());
        product.setAddableIngredients(request.getAddableIngredients());
        product.setCalorie(request.getCalorie());
        product.setGram(request.getGram());
        product.setPrepTimeMin(request.getPrepTimeMin());
        product.setActive(true);
        product.setInStock(true);
    }

    private void applyUpdateFields(Product product, ProductUpdateRequest request) {
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setVatIncluded(request.getVatIncluded());
        product.setIngredients(request.getIngredients());
        product.setRemovableIngredients(request.getRemovableIngredients());
        product.setAddableIngredients(request.getAddableIngredients());
        product.setCalorie(request.getCalorie());
        product.setGram(request.getGram());
        product.setPrepTimeMin(request.getPrepTimeMin());
        product.setActive(request.getActive());
        product.setInStock(request.getInStock());
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setCategoryId(product.getCategory().getId());
        response.setSubCategoryId(product.getSubCategory() != null ? product.getSubCategory().getId() : null);
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setImageUrl(product.getImageUrl());
        response.setVatIncluded(product.getVatIncluded());
        response.setIngredients(product.getIngredients());
        response.setRemovableIngredients(product.getRemovableIngredients());
        response.setAddableIngredients(product.getAddableIngredients());
        response.setCalorie(product.getCalorie());
        response.setGram(product.getGram());
        response.setPrepTimeMin(product.getPrepTimeMin());
        response.setAvgRating(product.getAvgRating());
        response.setActive(product.getActive());
        response.setInStock(product.getInStock());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    @Transactional(readOnly = true)
    public ProductOrderInfoResponse getOrderInfoById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        return toOrderInfoResponse(product);
    }

    private ProductOrderInfoResponse toOrderInfoResponse(Product product) {
        ProductOrderInfoResponse response = new ProductOrderInfoResponse();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setVatIncluded(product.getVatIncluded());
        response.setActive(product.getActive());
        response.setInStock(product.getInStock());
        response.setIngredients(product.getIngredients());
        response.setRemovableIngredients(product.getRemovableIngredients());
        response.setAddableIngredients(product.getAddableIngredients());
        response.setPrepTimeMin(product.getPrepTimeMin());
        response.setCategoryId(product.getCategory().getId());
        response.setSubCategoryId(product.getSubCategory() != null ? product.getSubCategory().getId() : null);

        return response;
    }
}
