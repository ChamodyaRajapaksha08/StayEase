package com.stayease.dto.tenant;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.dto.room.RoomDto;
import com.stayease.entity.TenantProfile;
import com.stayease.entity.enums.OccupancyStatus;

import java.time.LocalDate;

public class TenantDto {
    private Long id;
    private UserDto user;
    private String emergencyContact;
    private String idCardNumber;
    private String address;
    private PropertyDto currentProperty;
    private RoomDto currentRoom;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private OccupancyStatus occupancyStatus;

    public TenantDto() {}

    public static TenantDto fromEntity(TenantProfile profile) {
        if (profile == null) return null;
        TenantDto dto = new TenantDto();
        dto.setId(profile.getId());
        dto.setUser(UserDto.fromEntity(profile.getUser()));
        dto.setEmergencyContact(profile.getEmergencyContact());
        dto.setIdCardNumber(profile.getIdCardNumber());
        dto.setAddress(profile.getAddress());
        dto.setCurrentProperty(PropertyDto.fromEntity(profile.getCurrentProperty()));
        dto.setCurrentRoom(RoomDto.fromEntity(profile.getCurrentRoom()));
        dto.setCheckInDate(profile.getCheckInDate());
        dto.setCheckOutDate(profile.getCheckOutDate());
        dto.setOccupancyStatus(profile.getOccupancyStatus());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getIdCardNumber() { return idCardNumber; }
    public void setIdCardNumber(String idCardNumber) { this.idCardNumber = idCardNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public PropertyDto getCurrentProperty() { return currentProperty; }
    public void setCurrentProperty(PropertyDto currentProperty) { this.currentProperty = currentProperty; }

    public RoomDto getCurrentRoom() { return currentRoom; }
    public void setCurrentRoom(RoomDto currentRoom) { this.currentRoom = currentRoom; }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public OccupancyStatus getOccupancyStatus() { return occupancyStatus; }
    public void setOccupancyStatus(OccupancyStatus occupancyStatus) { this.occupancyStatus = occupancyStatus; }
}
