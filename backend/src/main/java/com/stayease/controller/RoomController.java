package com.stayease.controller;

import com.stayease.dto.room.RoomDto;
import com.stayease.dto.room.RoomRequest;
import com.stayease.entity.enums.AvailabilityStatus;
import com.stayease.entity.enums.RoomType;
import com.stayease.security.UserPrincipal;
import com.stayease.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/public")
    public ResponseEntity<List<RoomDto>> getPublicRooms(
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) RoomType roomType,
            @RequestParam(required = false) AvailabilityStatus status,
            @RequestParam(required = false) BigDecimal maxRent) {
        return ResponseEntity.ok(roomService.getRooms(propertyId, roomType, status, maxRent));
    }

    @GetMapping
    public ResponseEntity<List<RoomDto>> getRooms(
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) RoomType roomType,
            @RequestParam(required = false) AvailabilityStatus status,
            @RequestParam(required = false) BigDecimal maxRent) {
        return ResponseEntity.ok(roomService.getRooms(propertyId, roomType, status, maxRent));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDto> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<RoomDto> createRoom(
            @Valid @RequestBody RoomRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(roomService.createRoom(req, principal), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<RoomDto> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(roomService.updateRoom(id, req, principal));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        roomService.deleteRoom(id, principal);
        return ResponseEntity.noContent().build();
    }
}
