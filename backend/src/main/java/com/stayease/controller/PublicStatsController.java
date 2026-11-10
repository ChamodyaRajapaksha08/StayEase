package com.stayease.controller;

import com.stayease.dto.dashboard.PublicStatsDto;
import com.stayease.entity.enums.OccupancyStatus;
import com.stayease.repository.PropertyRepository;
import com.stayease.repository.TenantProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/stats")
public class PublicStatsController {

    private final PropertyRepository propertyRepository;
    private final TenantProfileRepository tenantProfileRepository;

    public PublicStatsController(PropertyRepository propertyRepository,
                                 TenantProfileRepository tenantProfileRepository) {
        this.propertyRepository = propertyRepository;
        this.tenantProfileRepository = tenantProfileRepository;
    }

    @GetMapping
    public ResponseEntity<PublicStatsDto> getPublicStats() {
        PublicStatsDto stats = new PublicStatsDto(
                propertyRepository.count(),
                tenantProfileRepository.countByOccupancyStatus(OccupancyStatus.ACTIVE)
        );
        return ResponseEntity.ok(stats);
    }
}
