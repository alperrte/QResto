package com.qresto.kitchen_service.controller;

import com.qresto.kitchen_service.dto.request.CreateKitchenCancelLogRequest;
import com.qresto.kitchen_service.entity.KitchenCancelLog;
import com.qresto.kitchen_service.service.KitchenCancelLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen/cancel-logs")
@RequiredArgsConstructor
public class KitchenCancelLogController {

    private final KitchenCancelLogService kitchenCancelLogService;

    @GetMapping
    public List<KitchenCancelLog> getAllLogs() {
        return kitchenCancelLogService.getAllLogs();
    }

    @PostMapping("/{kitchenOrderId}")
    public KitchenCancelLog createCancelLog(
            @PathVariable Long kitchenOrderId,
            @RequestBody CreateKitchenCancelLogRequest request
    ) {
        return kitchenCancelLogService.createCancelLog(kitchenOrderId, request);
    }

}