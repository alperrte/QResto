package com.qresto.qr_service.controller;

import com.qresto.qr_service.dto.response.OrderContextResponse;
import com.qresto.qr_service.service.TableSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/table-sessions")
@RequiredArgsConstructor
public class TableSessionController {

    private final TableSessionService tableSessionService;

    @GetMapping("/{tableSessionId}/order-context")
    public OrderContextResponse getOrderContext(@PathVariable Long tableSessionId,
                                                @RequestParam Long guestSessionId) {
        return tableSessionService.getOrderContext(tableSessionId, guestSessionId);
    }
}