package com.qresto.qr_service.service;

import com.qresto.qr_service.dto.request.CreateRestaurantTableRequest;
import com.qresto.qr_service.dto.request.UpdateRestaurantTableRequest;
import com.qresto.qr_service.dto.response.RestaurantTableResponse;
import com.qresto.qr_service.entity.RestaurantTable;
import com.qresto.qr_service.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.qresto.qr_service.entity.TableSession;
import com.qresto.qr_service.repository.GuestSessionRepository;
import com.qresto.qr_service.repository.TableQrCodeRepository;
import com.qresto.qr_service.repository.TableSessionRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {

    private final RestaurantTableRepository restaurantTableRepository;
    private final TableQrCodeRepository tableQrCodeRepository;
    private final TableSessionRepository tableSessionRepository;
    private final GuestSessionRepository guestSessionRepository;
    public RestaurantTableResponse createTable(CreateRestaurantTableRequest request) {
        String tableName = normalizeTableName(request.getName());
        ensureTableNameAvailable(tableName);

        RestaurantTable table = RestaurantTable.builder()
                .name(tableName)
                .capacity(request.getCapacity())
                .active(true)
                .build();

        RestaurantTable savedTable = restaurantTableRepository.save(table);

        return mapToResponse(savedTable);
    }

    public RestaurantTableResponse updateTable(Long tableId, UpdateRestaurantTableRequest request) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));

        String tableName = normalizeTableName(request.getName());
        ensureTableNameAvailable(tableName, tableId);

        table.setName(tableName);
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
                .name(table.getName())
                .capacity(table.getCapacity())
                .active(table.getActive())
                .createdAt(table.getCreatedAt())
                .updatedAt(table.getUpdatedAt())
                .build();
    }

    @Transactional
    public void deleteTable(Long tableId) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));

        List<TableSession> tableSessions = tableSessionRepository.findByRestaurantTableId(tableId);

        List<Long> tableSessionIds = tableSessions.stream()
                .map(TableSession::getId)
                .toList();

        if (!tableSessionIds.isEmpty()) {
            guestSessionRepository.deleteByTableSessionIdIn(tableSessionIds);
        }

        tableSessionRepository.deleteByRestaurantTableId(tableId);

        tableQrCodeRepository.deleteByRestaurantTableId(tableId);

        restaurantTableRepository.delete(table);
    }

    private String normalizeTableName(String name) {
        if (name == null) {
            return "";
        }

        return name.trim().replaceAll("\\s+", " ");
    }

    private void ensureTableNameAvailable(String name) {
        String normalizedName = normalizeTableName(name);

        boolean exists = restaurantTableRepository.findAll()
                .stream()
                .anyMatch(table -> normalizeTableName(table.getName()).equalsIgnoreCase(normalizedName));

        if (exists) {
            throw new RuntimeException("Bu isimde bir masa zaten var.");
        }
    }

    private void ensureTableNameAvailable(String name, Long currentTableId) {
        String normalizedName = normalizeTableName(name);

        boolean exists = restaurantTableRepository.findAll()
                .stream()
                .filter(table -> !table.getId().equals(currentTableId))
                .anyMatch(table -> normalizeTableName(table.getName()).equalsIgnoreCase(normalizedName));

        if (exists) {
            throw new RuntimeException("Bu isimde bir masa zaten var.");
        }
    }
}
