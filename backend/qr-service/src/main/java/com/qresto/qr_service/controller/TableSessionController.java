package com.qresto.qr_service.controller;

import com.qresto.qr_service.dto.response.OrderContextResponse;
import com.qresto.qr_service.dto.response.TableSessionResponse;
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
    @GetMapping("/active/table/{tableId}")
    public TableSessionResponse getActiveSessionByTable(@PathVariable Long tableId) {
        return tableSessionService.getActiveSessionByTable(tableId);
    }
    @PatchMapping("/active/table/{tableId}/close-by-waiter")
    public void closeActiveSessionByTableByWaiter(@PathVariable Long tableId) {
        tableSessionService.closeActiveSessionByTableByWaiter(tableId);
    }
    @PatchMapping("/{tableSessionId}/close-by-waiter")
    public void closeSessionByWaiter(@PathVariable Long tableSessionId) {
        tableSessionService.closeSessionByWaiter(tableSessionId);

    @PatchMapping("/{tableSessionId}/payment-pending")
    public TableSessionResponse markPaymentPending(@PathVariable Long tableSessionId) {
        return tableSessionService.markPaymentPending(tableSessionId);
    }

    @PatchMapping("/{tableSessionId}/close-after-payment")
    public TableSessionResponse closeAfterPayment(@PathVariable Long tableSessionId) {
        return tableSessionService.closeAfterPayment(tableSessionId);
    }
}