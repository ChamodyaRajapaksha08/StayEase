package com.stayease.dto.room;

import com.stayease.entity.Room;
import com.stayease.entity.enums.AvailabilityStatus;
import com.stayease.entity.enums.RoomType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RoomDto {
    private Long id;
    private Long propertyId;
    private String propertyName;
    private String roomNumber;
    private RoomType roomType;
    private Integer capacity;
    private Integer availableBeds;
    private BigDecimal monthlyRent;
    private String facilities;
    private String imageUrl;
    private AvailabilityStatus availabilityStatus;
    private LocalDateTime createdAt;

    public RoomDto() {}

    public static RoomDto fromEntity(Room room) {
        if (room == null) return null;
        RoomDto dto = new RoomDto();
        dto.setId(room.getId());
        if (room.getProperty() != null) {
            dto.setPropertyId(room.getProperty().getId());
            dto.setPropertyName(room.getProperty().getName());
        }
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        dto.setCapacity(room.getCapacity());
        dto.setAvailableBeds(room.getAvailableBeds());
        dto.setMonthlyRent(room.getMonthlyRent());
        dto.setFacilities(room.getFacilities());
        dto.setImageUrl(room.getImageUrl());
        dto.setAvailabilityStatus(room.getAvailabilityStatus());
        dto.setCreatedAt(room.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public String getPropertyName() { return propertyName; }
    public void setPropertyName(String propertyName) { this.propertyName = propertyName; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getAvailableBeds() { return availableBeds; }
    public void setAvailableBeds(Integer availableBeds) { this.availableBeds = availableBeds; }

    public BigDecimal getMonthlyRent() { return monthlyRent; }
    public void setMonthlyRent(BigDecimal monthlyRent) { this.monthlyRent = monthlyRent; }

    public String getFacilities() { return facilities; }
    public void setFacilities(String facilities) { this.facilities = facilities; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public AvailabilityStatus getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
