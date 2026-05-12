package com.qresto.menu_service.entity;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_option_group", schema = "menu")
@Getter
@Setter
@NoArgsConstructor
public class ProductOptionGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "kind", nullable = false, length = 20)
    private String kind;

    @Column(name = "has_price", nullable = false)
    private Boolean hasPrice = true;

    @Column(name = "user_title", nullable = false, length = 200)
    private String userTitle = "";

    @Column(name = "meta_title", nullable = false, length = 200)
    private String metaTitle = "";

    @Column(name = "description_line", length = 500)
    private String descriptionLine;

    @Column(name = "required", nullable = false)
    private Boolean required = false;

    @Column(name = "max_select", nullable = false)
    private Integer maxSelect = 1;

    @Column(name = "included_in_preview", nullable = false)
    private Boolean includedInPreview = false;

    @OneToMany(mappedBy = "optionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ProductOptionChoice> choices = new ArrayList<>();
}
