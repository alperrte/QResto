package com.qresto.menu_service.service;

import com.qresto.menu_service.dto.product.ProductCreateRequest;
import com.qresto.menu_service.dto.product.ProductOptionChoiceRequest;
import com.qresto.menu_service.dto.product.ProductOptionChoiceResponse;
import com.qresto.menu_service.dto.product.ProductOptionGroupRequest;
import com.qresto.menu_service.dto.product.ProductOptionGroupResponse;
import com.qresto.menu_service.dto.product.ProductOrderInfoResponse;
import com.qresto.menu_service.dto.product.ProductResponse;
import com.qresto.menu_service.dto.product.ProductUpdateRequest;
import com.qresto.menu_service.entity.Category;
import com.qresto.menu_service.entity.Product;
import com.qresto.menu_service.entity.ProductOptionChoice;
import com.qresto.menu_service.entity.ProductOptionGroup;
import com.qresto.menu_service.entity.SubCategory;
import com.qresto.menu_service.repository.CategoryRepository;
import com.qresto.menu_service.repository.ProductRepository;
import com.qresto.menu_service.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public ProductResponse create(ProductCreateRequest request) {
        Product product = new Product();

        if (request.getCategoryId() == null) {
            // Kategorisiz ürün (kategori silinmiş veya bilinçli olarak seçilmemiş).
            product.setCategory(null);
            product.setSubCategory(null);
        } else {
            Category category = findCategory(request.getCategoryId());
            SubCategory subCategory = findSubCategoryIfPresent(request.getSubCategoryId());
            validateSubCategoryCategoryMatch(category, subCategory);

            product.setCategory(category);
            product.setSubCategory(subCategory);
        }

        applyCreateFields(product, request);
        replaceOptionGroups(product, request.getOptionGroups());

        return toResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        initializeOptionCollections(product);
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
        // Müşteri menüsü için görünür ürünler:
        // - ürün aktif olmalı
        // - kategori aktif olmalı veya kategori hiç atanmadı (null)
        return productRepository.findCustomerVisibleActiveProducts().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listByCategory(Long categoryId) {
        return productRepository.findCustomerVisibleActiveProductsByCategory(categoryId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listBySubCategory(Long subCategoryId) {
        return productRepository.findCustomerVisibleActiveProductsBySubCategory(subCategoryId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchActiveProducts(String keyword) {
        return productRepository.searchCustomerVisibleActiveProducts(keyword.trim()).stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse update(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        initializeOptionCollections(product);

        if (request.getCategoryId() == null) {
            product.setCategory(null);
            product.setSubCategory(null);
        } else {
            Category category = findCategory(request.getCategoryId());
            SubCategory subCategory = findSubCategoryIfPresent(request.getSubCategoryId());
            validateSubCategoryCategoryMatch(category, subCategory);
            product.setCategory(category);
            product.setSubCategory(subCategory);
        }
        applyUpdateFields(product, request);
        if (request.getOptionGroups() != null) {
            replaceOptionGroups(product, request.getOptionGroups());
        }

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

    /**
     * Çift JOIN FETCH yerine tek transaction'da lazy koleksiyonları yükler (Hibernate çoklu bag / DISTINCT sorunlarından kaçınır).
     */
    private void initializeOptionCollections(Product product) {
        for (ProductOptionGroup group : product.getOptionGroups()) {
            group.getChoices().size();
        }
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
        product.setActive(request.getActive() == null ? Boolean.TRUE : request.getActive());
        product.setInStock(request.getInStock() == null ? Boolean.TRUE : request.getInStock());
        applyCreateOrderNote(product, request.getOrderNoteEnabled(), request.getOrderNoteTitle());
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
        applyUpdateOrderNote(product, request.getOrderNoteEnabled(), request.getOrderNoteTitle());
    }

    private void applyCreateOrderNote(Product product, Boolean enabled, String title) {
        product.setOrderNoteEnabled(enabled != null && enabled);
        String t = title == null ? null : title.trim();
        product.setOrderNoteTitle(t == null || t.isEmpty() ? null : t);
    }

    private void applyUpdateOrderNote(Product product, Boolean enabled, String title) {
        if (enabled != null) {
            product.setOrderNoteEnabled(enabled);
        }
        if (title != null) {
            String t = title.trim();
            product.setOrderNoteTitle(t.isEmpty() ? null : t);
        }
    }

    private void replaceOptionGroups(Product product, List<ProductOptionGroupRequest> groups) {
        product.getOptionGroups().clear();
        if (groups == null || groups.isEmpty()) {
            return;
        }
        int groupIndex = 0;
        for (ProductOptionGroupRequest gr : groups) {
            if (gr == null) {
                continue;
            }
            String kind = normalizeKind(gr.getKind());
            List<ProductOptionChoiceRequest> rawChoices = gr.getChoices() != null ? gr.getChoices() : List.of();
            List<ProductOptionChoiceRequest> usableChoices = new ArrayList<>();
            for (ProductOptionChoiceRequest ch : rawChoices) {
                if (ch == null) {
                    continue;
                }
                String label = ch.getLabel() == null ? "" : ch.getLabel().trim();
                if (label.isEmpty()) {
                    continue;
                }
                usableChoices.add(ch);
            }
            if (usableChoices.isEmpty()) {
                continue;
            }

            ProductOptionGroup og = new ProductOptionGroup();
            og.setProduct(product);
            og.setSortOrder(groupIndex++);
            og.setKind(kind);
            og.setHasPrice(gr.getHasPrice() == null || gr.getHasPrice());
            og.setUserTitle(trimToEmpty(gr.getUserTitle(), 200));
            og.setMetaTitle(trimToEmpty(gr.getMetaTitle(), 200));
            og.setDescriptionLine(trimNullable(gr.getDescriptionLine(), 500));
            boolean required = Boolean.TRUE.equals(gr.getRequired());
            if ("portion".equals(kind)) {
                required = true;
            }
            og.setRequired(required);
            int maxSelect = gr.getMaxSelect() != null ? gr.getMaxSelect() : 1;
            if (!"multi".equals(kind)) {
                maxSelect = 1;
            } else {
                maxSelect = Math.max(1, maxSelect);
            }
            og.setMaxSelect(maxSelect);
            og.setIncludedInPreview(Boolean.TRUE.equals(gr.getIncludedInPreview()));

            int choiceIndex = 0;
            for (ProductOptionChoiceRequest ch : usableChoices) {
                ProductOptionChoice c = new ProductOptionChoice();
                c.setOptionGroup(og);
                c.setSortOrder(choiceIndex++);
                c.setLabel(ch.getLabel().trim());
                BigDecimal delta = ch.getPriceDelta() != null ? ch.getPriceDelta() : BigDecimal.ZERO;
                if (!og.getHasPrice()) {
                    delta = BigDecimal.ZERO;
                }
                c.setPriceDelta(delta);
                og.getChoices().add(c);
            }
            product.getOptionGroups().add(og);
        }
    }

    private static String normalizeKind(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Option group kind is required");
        }
        String k = raw.trim().toLowerCase(Locale.ROOT);
        if (!List.of("portion", "single", "multi").contains(k)) {
            throw new IllegalArgumentException("Invalid option group kind: " + raw);
        }
        return k;
    }

    private static String trimToEmpty(String s, int maxLen) {
        if (s == null) {
            return "";
        }
        String t = s.trim();
        return t.length() > maxLen ? t.substring(0, maxLen) : t;
    }

    private static String trimNullable(String s, int maxLen) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        if (t.isEmpty()) {
            return null;
        }
        return t.length() > maxLen ? t.substring(0, maxLen) : t;
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
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
        response.setOrderNoteEnabled(product.getOrderNoteEnabled());
        response.setOrderNoteTitle(product.getOrderNoteTitle());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        if (Hibernate.isInitialized(product.getOptionGroups())) {
            response.setOptionGroups(mapOptionGroupResponses(product.getOptionGroups()));
        } else {
            response.setOptionGroups(null);
        }
        return response;
    }

    private List<ProductOptionGroupResponse> mapOptionGroupResponses(List<ProductOptionGroup> groups) {
        if (groups == null) {
            return List.of();
        }
        return groups.stream().filter(Objects::nonNull).map(this::mapOptionGroup).toList();
    }

    private ProductOptionGroupResponse mapOptionGroup(ProductOptionGroup g) {
        ProductOptionGroupResponse dto = new ProductOptionGroupResponse();
        dto.setId(g.getId());
        dto.setSortOrder(g.getSortOrder());
        dto.setKind(g.getKind());
        dto.setHasPrice(g.getHasPrice());
        dto.setUserTitle(g.getUserTitle());
        dto.setMetaTitle(g.getMetaTitle());
        dto.setDescriptionLine(g.getDescriptionLine());
        dto.setRequired(g.getRequired());
        dto.setMaxSelect(g.getMaxSelect());
        dto.setIncludedInPreview(g.getIncludedInPreview());
        List<ProductOptionChoiceResponse> choiceDtos = g.getChoices().stream().map(this::mapChoice).toList();
        dto.setChoices(choiceDtos);
        return dto;
    }

    private ProductOptionChoiceResponse mapChoice(ProductOptionChoice c) {
        ProductOptionChoiceResponse dto = new ProductOptionChoiceResponse();
        dto.setId(c.getId());
        dto.setSortOrder(c.getSortOrder());
        dto.setLabel(c.getLabel());
        dto.setPriceDelta(c.getPriceDelta());
        return dto;
    }

    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        initializeOptionCollections(product);
        productRepository.delete(product);
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
        response.setImageUrl(product.getImageUrl());
        response.setVatIncluded(product.getVatIncluded());
        response.setActive(product.getActive());
        response.setInStock(product.getInStock());
        response.setIngredients(product.getIngredients());
        response.setRemovableIngredients(product.getRemovableIngredients());
        response.setAddableIngredients(product.getAddableIngredients());
        response.setPrepTimeMin(product.getPrepTimeMin());
        response.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        response.setSubCategoryId(product.getSubCategory() != null ? product.getSubCategory().getId() : null);

        return response;
    }
}
