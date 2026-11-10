package com.stayease.controller;

import com.stayease.dto.tenant.TenantDto;
import com.stayease.dto.tenant.TenantUpdateRequest;
import com.stayease.security.UserPrincipal;
import com.stayease.service.TenantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    public ResponseEntity<List<TenantDto>> getTenants(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId) {
        return ResponseEntity.ok(tenantService.getTenants(principal, propertyId));
    }

    @GetMapping("/me")
    public ResponseEntity<TenantDto> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tenantService.getMyProfile(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TenantDto> getTenantById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tenantService.getTenantById(id, principal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto> updateTenant(
            @PathVariable Long id,
            @RequestBody TenantUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tenantService.updateTenant(id, req, principal));
    }
}
