package com.stayease.controller;

import com.stayease.dto.maintenance.MaintenanceCreateRequest;
import com.stayease.dto.maintenance.MaintenanceRequestDto;
import com.stayease.dto.maintenance.MaintenanceStatusUpdateRequest;
import com.stayease.entity.enums.MaintenanceStatus;
import com.stayease.security.UserPrincipal;
import com.stayease.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequestDto> createRequest(
            @Valid @RequestBody MaintenanceCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(maintenanceService.createRequest(req, principal), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceRequestDto>> getRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) MaintenanceStatus status) {
        return ResponseEntity.ok(maintenanceService.getRequests(principal, propertyId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequestDto> getRequestById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(maintenanceService.getRequestById(id, principal));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<MaintenanceRequestDto> updateRequestStatus(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceStatusUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(maintenanceService.updateRequestStatus(id, req, principal));
    }
}
