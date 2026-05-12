package com.qresto.menu_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ProductImageStorageService {

    private static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final Pattern STORED_NAME = Pattern.compile("^[0-9a-fA-F-]{36}\\.(jpg|jpeg|png|gif|webp)$");

    private static final Set<String> ALLOWED_EXT = Set.of("jpg", "jpeg", "png", "gif", "webp");

    private static final Map<String, String> MIME_TO_EXT = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/gif", "gif",
            "image/webp", "webp"
    );

    private final Path root;

    public ProductImageStorageService(
            @Value("${qresto.menu.product-images-dir:./data/menu-product-images}") String configuredDir
    ) throws IOException {
        this.root = Path.of(configuredDir).toAbsolutePath().normalize();
        Files.createDirectories(this.root);
    }

    /**
     * Dosyayı kaydeder; dönen ad yalnızca güvenli karakterler içerir (GET ile servis için).
     */
    public String save(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Dosya boş olamaz.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Görsel en fazla 10 MB olabilir.");
        }

        String ext = resolveExtension(file);
        String fileName = UUID.randomUUID() + "." + ext;
        Path target = root.resolve(fileName).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalStateException("Geçersiz hedef yolu.");
        }

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        return fileName;
    }

    public Path resolveExisting(String fileName) {
        if (fileName == null || !STORED_NAME.matcher(fileName).matches()) {
            throw new IllegalArgumentException("Geçersiz dosya adı.");
        }
        Path target = root.resolve(fileName).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Geçersiz dosya adı.");
        }
        if (!Files.isRegularFile(target)) {
            throw new IllegalArgumentException("Dosya bulunamadı.");
        }
        return target;
    }

    private String resolveExtension(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            String ext = original.substring(original.lastIndexOf('.') + 1).trim().toLowerCase(Locale.ROOT);
            if (ALLOWED_EXT.contains(ext)) {
                return "jpeg".equals(ext) ? "jpg" : ext;
            }
        }
        String contentType = file.getContentType();
        if (contentType != null) {
            String normalized = contentType.split(";")[0].trim().toLowerCase(Locale.ROOT);
            String fromMime = MIME_TO_EXT.get(normalized);
            if (fromMime != null) {
                return fromMime;
            }
        }
        throw new IllegalArgumentException("Yalnızca PNG, JPG, GIF veya WEBP yükleyebilirsiniz.");
    }
}
