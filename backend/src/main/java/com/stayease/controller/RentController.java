package com.stayease.controller;

import com.stayease.dto.finance.RentRecordDto;
import com.stayease.dto.finance.RentRecordRequest;
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
@RequestMapping("/api/rent")
public class RentController {

    private final FinanceService financeService;

    public RentController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public ResponseEntity<List<RentRecordDto>> getRentRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) RentStatus status) {
        return ResponseEntity.ok(financeService.getRentRecords(principal, propertyId, status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<RentRecordDto> createRentRecord(
            @Valid @RequestBody RentRecordRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(financeService.createRentRecord(req, principal), HttpStatus.CREATED);
    }
}
