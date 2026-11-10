package com.stayease.dto.maintenance;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.dto.room.RoomDto;
import com.stayease.entity.MaintenanceRequest;
import com.stayease.entity.enums.MaintenanceCategory;
import com.stayease.entity.enums.MaintenanceStatus;

import java.time.LocalDateTime;

public class MaintenanceRequestDto {
    private Long id;
    private UserDto tenant;
    private PropertyDto property;
    private RoomDto room;
    private MaintenanceCategory category;
    private String description;
    private String imageUrl;
    private MaintenanceStatus status;
    private String resolutionNotes;
    private LocalDateTime submittedDate;
    private LocalDateTime resolvedDate;
    private LocalDateTime createdAt;

    public MaintenanceRequestDto() {}

    public static MaintenanceRequestDto fromEntity(MaintenanceRequest req) {
        if (req == null) return null;
        MaintenanceRequestDto dto = new MaintenanceRequestDto();
        dto.setId(req.getId());
        dto.setTenant(UserDto.fromEntity(req.getTenant()));
        dto.setProperty(PropertyDto.fromEntity(req.getProperty()));
        dto.setRoom(RoomDto.fromEntity(req.getRoom()));
        dto.setCategory(req.getCategory());
        dto.setDescription(req.getDescription());
        dto.setImageUrl(req.getImageUrl());
        dto.setStatus(req.getStatus());
        dto.setResolutionNotes(req.getResolutionNotes());
        dto.setSubmittedDate(req.getSubmittedDate());
        dto.setResolvedDate(req.getResolvedDate());
        dto.setCreatedAt(req.getCreatedAt());
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

    public MaintenanceCategory getCategory() { return category; }
    public void setCategory(MaintenanceCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public MaintenanceStatus getStatus() { return status; }
    public void setStatus(MaintenanceStatus status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(LocalDateTime submittedDate) { this.submittedDate = submittedDate; }

    public LocalDateTime getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(LocalDateTime resolvedDate) { this.resolvedDate = resolvedDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
