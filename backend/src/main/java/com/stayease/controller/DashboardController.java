package com.stayease.controller;

import com.stayease.dto.dashboard.ManagerDashboardDto;
import com.stayease.dto.dashboard.OwnerDashboardDto;
import com.stayease.dto.dashboard.SuperAdminDashboardDto;
import com.stayease.dto.dashboard.TenantDashboardDto;
import com.stayease.security.UserPrincipal;
import com.stayease.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/superadmin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SuperAdminDashboardDto> getSuperAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getSuperAdminDashboard());
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OwnerDashboardDto> getOwnerDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getOwnerDashboard(principal.getId()));
    }

    @GetMapping("/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ManagerDashboardDto> getManagerDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getManagerDashboard(principal.getId()));
    }

    @GetMapping("/tenant")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<TenantDashboardDto> getTenantDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getTenantDashboard(principal.getId()));
    }
}
