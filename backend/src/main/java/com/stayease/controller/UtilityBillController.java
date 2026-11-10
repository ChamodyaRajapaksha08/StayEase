package com.stayease.controller;

import com.stayease.dto.finance.UtilityBillDto;
import com.stayease.dto.finance.UtilityBillRequest;
import com.stayease.entity.enums.RentStatus;
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
@RequestMapping("/api/utility-bills")
public class UtilityBillController {

    private final FinanceService financeService;

    public UtilityBillController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public ResponseEntity<List<UtilityBillDto>> getUtilityBills(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) RentStatus status) {
        return ResponseEntity.ok(financeService.getUtilityBills(principal, propertyId, status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<UtilityBillDto> createUtilityBill(
            @Valid @RequestBody UtilityBillRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(financeService.createUtilityBill(req, principal), HttpStatus.CREATED);
    }
}
