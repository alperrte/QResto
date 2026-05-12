package com.qresto.menu_service.dto.product;

/**
 * Ürün görseli yükleme sonucu: istemci bu URL'yi ürünün imageUrl alanına yazar.
 */
public record ProductImageUploadResponse(String url) {
}
