package com.stayease.controller;

import com.stayease.dto.announcement.AnnouncementDto;
import com.stayease.dto.announcement.AnnouncementRequest;
import com.stayease.security.UserPrincipal;
import com.stayease.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping("/public")
    public ResponseEntity<List<AnnouncementDto>> getPublicAnnouncements(@RequestParam(required = false) Long propertyId) {
        return ResponseEntity.ok(announcementService.getAnnouncements(propertyId));
    }

    @GetMapping
    public ResponseEntity<List<AnnouncementDto>> getAnnouncements(@RequestParam(required = false) Long propertyId) {
        return ResponseEntity.ok(announcementService.getAnnouncements(propertyId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<AnnouncementDto> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(announcementService.createAnnouncement(req, principal), HttpStatus.CREATED);
    }
}
