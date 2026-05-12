package com.qresto.menu_service.controller;

import com.qresto.menu_service.dto.product.ProductImageUploadResponse;
import com.qresto.menu_service.service.ProductImageStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/menu/product-images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageStorageService productImageStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImageUploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) throws IOException {
        String storedName = productImageStorageService.save(file);
        String url = buildAbsoluteImageUrl(request, storedName);
        return ResponseEntity.ok(new ProductImageUploadResponse(url));
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> serve(@PathVariable("fileName") String fileName) throws IOException {
        Path path;
        try {
            path = productImageStorageService.resolveExisting(fileName);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(path.toFile());
        String probed = Files.probeContentType(path);
        MediaType mediaType = probed != null
                ? MediaType.parseMediaType(probed)
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                .contentType(mediaType)
                .body(resource);
    }

    private static String buildAbsoluteImageUrl(HttpServletRequest request, String fileName) {
        return UriComponentsBuilder.newInstance()
                .scheme(request.getScheme())
                .host(request.getServerName())
                .port(request.getServerPort())
                .path("/api/menu/product-images/" + fileName)
                .build()
                .encode()
                .toUriString();
    }
}
