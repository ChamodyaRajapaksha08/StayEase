package com.stayease.controller;

import com.stayease.dto.booking.BookingDto;
import com.stayease.dto.booking.BookingRequest;
import com.stayease.dto.booking.BookingStatusUpdateRequest;
import com.stayease.entity.enums.BookingStatus;
import com.stayease.security.UserPrincipal;
import com.stayease.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(
            @Valid @RequestBody BookingRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return new ResponseEntity<>(bookingService.createBooking(req, principal), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingDto>> getBookings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(bookingService.getBookings(principal, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getBookingById(id, principal));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDto> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, req, principal));
    }
}
