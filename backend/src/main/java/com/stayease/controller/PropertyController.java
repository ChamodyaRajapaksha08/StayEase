package com.stayease.controller;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.ManagerAssignmentRequest;
import com.stayease.dto.property.PropertyDto;
import com.stayease.dto.property.PropertyRequest;
import com.stayease.security.UserPrincipal;
import com.stayease.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping("/public")
    public ResponseEntity<List<PropertyDto>> getPublicProperties(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(propertyService.getPropertiesForUser(null, keyword, city));
    }

    @GetMapping
    public ResponseEntity<List<PropertyDto>> getProperties(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(propertyService.getPropertiesForUser(principal, keyword, city));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyDto> getPropertyById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(propertyService.getPropertyById(id, principal));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<PropertyDto> createProperty(
            @Valid @RequestBody PropertyRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(propertyService.createProperty(req, principal), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<PropertyDto> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(propertyService.updateProperty(id, req, principal));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        propertyService.deleteProperty(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign-manager")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<Void> assignManager(
            @PathVariable Long id,
            @Valid @RequestBody ManagerAssignmentRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        propertyService.assignManager(id, req.getManagerId(), principal);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/managers/{managerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<Void> removeManager(
            @PathVariable Long id,
            @PathVariable Long managerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        propertyService.removeManager(id, managerId, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/managers")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<List<UserDto>> getPropertyManagers(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(propertyService.getManagersForProperty(id, principal));
    }
}
