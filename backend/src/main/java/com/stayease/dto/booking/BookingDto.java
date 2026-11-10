package com.stayease.dto.booking;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.dto.room.RoomDto;
import com.stayease.entity.Booking;
import com.stayease.entity.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDto {
    private Long id;
    private UserDto tenant;
    private PropertyDto property;
    private RoomDto room;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BookingStatus status;
    private String notes;
    private LocalDateTime createdAt;

    public BookingDto() {}

    public static BookingDto fromEntity(Booking booking) {
        if (booking == null) return null;
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setTenant(UserDto.fromEntity(booking.getTenant()));
        dto.setProperty(PropertyDto.fromEntity(booking.getProperty()));
        dto.setRoom(RoomDto.fromEntity(booking.getRoom()));
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setStatus(booking.getStatus());
        dto.setNotes(booking.getNotes());
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserDto getTenant() { return tenant; }
    public void setTenant(UserDto tenant) { this.tenant = tenant; }

    public PropertyDto getProperty() { return property; }
    public void setProperty(PropertyDto property) { this.property = property; }

    public RoomDto getRoom() { return room; }
    public void setRoom(RoomDto room) { this.room = room; }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
