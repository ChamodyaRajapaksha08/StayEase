package com.stayease.controller;

import com.stayease.dto.finance.PaymentDto;
import com.stayease.dto.finance.PaymentRequest;
import com.stayease.security.UserPrincipal;
import com.stayease.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final FinanceService financeService;

    public PaymentController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getPayments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId) {
        return ResponseEntity.ok(financeService.getPayments(principal, propertyId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<PaymentDto> recordPayment(
            @Valid @RequestBody PaymentRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(financeService.recordPayment(req, principal), HttpStatus.CREATED);
    }

    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<PaymentDto> getPaymentReceipt(@PathVariable String receiptNumber) {
        return ResponseEntity.ok(financeService.getPaymentByReceipt(receiptNumber));
    }
}
