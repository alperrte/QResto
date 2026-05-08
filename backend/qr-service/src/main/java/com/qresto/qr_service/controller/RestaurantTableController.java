package com.qresto.qr_service.controller;

import com.qresto.qr_service.dto.request.CreateRestaurantTableRequest;
import com.qresto.qr_service.dto.request.UpdateRestaurantTableRequest;
import com.qresto.qr_service.dto.response.RestaurantTableResponse;
import com.qresto.qr_service.service.RestaurantTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService restaurantTableService;

    @PostMapping
    public RestaurantTableResponse createTable(@Valid @RequestBody CreateRestaurantTableRequest request) {
        return restaurantTableService.createTable(request);
    }

    @PutMapping("/{tableId}")
    public RestaurantTableResponse updateTable(@PathVariable Long tableId,
                                               @Valid @RequestBody UpdateRestaurantTableRequest request) {
        return restaurantTableService.updateTable(tableId, request);
    }

    @PatchMapping("/{tableId}/activate")
    public void activateTable(@PathVariable Long tableId) {
        restaurantTableService.activateTable(tableId);
    }

    @PatchMapping("/{tableId}/deactivate")
    public void deactivateTable(@PathVariable Long tableId) {
        restaurantTableService.deactivateTable(tableId);
    }

    @GetMapping
    public List<RestaurantTableResponse> getAllTables() {
        return restaurantTableService.getAllTables();
    }

    @GetMapping("/{tableId}")
    public RestaurantTableResponse getTableById(@PathVariable Long tableId) {
        return restaurantTableService.getTableById(tableId);
    }

    @DeleteMapping("/{tableId}")
    public void deleteTable(@PathVariable Long tableId) {
        restaurantTableService.deleteTable(tableId);
    }
}