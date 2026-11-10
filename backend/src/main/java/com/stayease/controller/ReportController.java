package com.stayease.controller;

import com.stayease.dto.report.IncomeReportDto;
import com.stayease.dto.report.MaintenanceReportDto;
import com.stayease.dto.report.OccupancyReportDto;
import com.stayease.security.UserPrincipal;
import com.stayease.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/income")
    public ResponseEntity<IncomeReportDto> getIncomeReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getIncomeReport(principal, propertyId, startDate, endDate));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<OccupancyReportDto> getOccupancyReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId) {
        return ResponseEntity.ok(reportService.getOccupancyReport(principal, propertyId));
    }

    @GetMapping("/maintenance")
    public ResponseEntity<MaintenanceReportDto> getMaintenanceReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId) {
        return ResponseEntity.ok(reportService.getMaintenanceReport(principal, propertyId));
    }

    @GetMapping("/export/payments-csv")
    public ResponseEntity<byte[]> exportPaymentsCsv(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long propertyId) {
        String csv = reportService.exportPaymentsCsv(principal, propertyId);
        byte[] bytes = csv.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=StayEase-Payments-Report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
