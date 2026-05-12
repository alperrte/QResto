package com.qresto.menu_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product", schema = "menu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "category_id", nullable = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private SubCategory subCategory;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "vat_included", nullable = false)
    private Boolean vatIncluded = true;

    @Column(name = "ingredients", length = 1500)
    private String ingredients;

    @Column(name = "removable_ingredients", length = 1500)
    private String removableIngredients;

    @Column(name = "addable_ingredients", length = 1500)
    private String addableIngredients;

    @Column(name = "calorie")
    private Integer calorie;

    @Column(name = "gram")
    private Integer gram;

    @Column(name = "prep_time_min")
    private Integer prepTimeMin;

    @Column(name = "avg_rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "in_stock", nullable = false)
    private Boolean inStock = true;

    @Column(name = "order_note_enabled", nullable = false)
    private Boolean orderNoteEnabled = false;

    @Column(name = "order_note_title", length = 200)
    private String orderNoteTitle;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ProductOptionGroup> optionGroups = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.active == null) {
            this.active = true;
        }
        if (this.inStock == null) {
            this.inStock = true;
        }
        if (this.vatIncluded == null) {
            this.vatIncluded = true;
        }
        if (this.avgRating == null) {
            this.avgRating = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}