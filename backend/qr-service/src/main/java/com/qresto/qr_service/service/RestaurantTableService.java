package com.qresto.qr_service.service;

import com.qresto.qr_service.dto.request.CreateRestaurantTableRequest;
import com.qresto.qr_service.dto.request.UpdateRestaurantTableRequest;
import com.qresto.qr_service.dto.response.RestaurantTableResponse;
import com.qresto.qr_service.entity.RestaurantTable;
import com.qresto.qr_service.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {

    private final RestaurantTableRepository restaurantTableRepository;

    public RestaurantTableResponse createTable(CreateRestaurantTableRequest request) {
        if (restaurantTableRepository.existsByTableNo(request.getTableNo())) {
            throw new RuntimeException("Table number already exists: " + request.getTableNo());
        }

        RestaurantTable table = RestaurantTable.builder()
                .tableNo(request.getTableNo())
                .name(request.getName())
                .capacity(request.getCapacity())
                .active(true)
                .build();

        RestaurantTable savedTable = restaurantTableRepository.save(table);

        return mapToResponse(savedTable);
    }

    public RestaurantTableResponse updateTable(Long tableId, UpdateRestaurantTableRequest request) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));

        table.setName(request.getName());
        table.setCapacity(request.getCapacity());

        if (request.getActive() != null) {
            table.setActive(request.getActive());
        }

        RestaurantTable updatedTable = restaurantTableRepository.save(table);
        return mapToResponse(updatedTable);
    }

    public void activateTable(Long tableId) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));

        table.setActive(true);
        restaurantTableRepository.save(table);
    }

    public void deactivateTable(Long tableId) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));

        table.setActive(false);
        restaurantTableRepository.save(table);
    }

    public List<RestaurantTableResponse> getAllTables() {
        return restaurantTableRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public RestaurantTableResponse getTableById(Long tableId) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));

        return mapToResponse(table);
    }

    private RestaurantTableResponse mapToResponse(RestaurantTable table) {
        return RestaurantTableResponse.builder()
                .id(table.getId())
                .tableNo(table.getTableNo())
                .name(table.getName())
                .capacity(table.getCapacity())
                .active(table.getActive())
                .createdAt(table.getCreatedAt())
                .updatedAt(table.getUpdatedAt())
                .build();
    }
}