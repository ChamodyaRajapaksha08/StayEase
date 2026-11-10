package com.stayease.dto.property;

import com.stayease.dto.auth.UserDto;
import com.stayease.entity.Property;
import com.stayease.entity.enums.PropertyType;
import com.stayease.entity.enums.UserStatus;

import java.time.LocalDateTime;

public class PropertyDto {
    private Long id;
    private String name;
    private PropertyType type;
    private String description;
    private String address;
    private String city;
    private String contactNumber;
    private String imageUrl;
    private UserDto owner;
    private UserStatus status;
    private int totalRooms;
    private int availableRooms;
    private LocalDateTime createdAt;

    public PropertyDto() {}

    public static PropertyDto fromEntity(Property property) {
        if (property == null) return null;
        PropertyDto dto = new PropertyDto();
        dto.setId(property.getId());
        dto.setName(property.getName());
        dto.setType(property.getType());
        dto.setDescription(property.getDescription());
        dto.setAddress(property.getAddress());
        dto.setCity(property.getCity());
        dto.setContactNumber(property.getContactNumber());
        dto.setImageUrl(property.getImageUrl());
        dto.setOwner(UserDto.fromEntity(property.getOwner()));
        dto.setStatus(property.getStatus());
        dto.setCreatedAt(property.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public PropertyType getType() { return type; }
    public void setType(PropertyType type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public UserDto getOwner() { return owner; }
    public void setOwner(UserDto owner) { this.owner = owner; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public int getTotalRooms() { return totalRooms; }
    public void setTotalRooms(int totalRooms) { this.totalRooms = totalRooms; }

    public int getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(int availableRooms) { this.availableRooms = availableRooms; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
