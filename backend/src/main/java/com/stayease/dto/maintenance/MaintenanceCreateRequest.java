package com.stayease.dto.maintenance;

import com.stayease.entity.enums.MaintenanceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MaintenanceCreateRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    private Long roomId;

    @NotNull(message = "Category is required")
    private MaintenanceCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    private String imageUrl;

    public MaintenanceCreateRequest() {}

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public MaintenanceCategory getCategory() { return category; }
    public void setCategory(MaintenanceCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
