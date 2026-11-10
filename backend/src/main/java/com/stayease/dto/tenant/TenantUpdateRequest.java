package com.stayease.dto.tenant;

import com.stayease.entity.enums.OccupancyStatus;
import java.time.LocalDate;

public class TenantUpdateRequest {
    private String emergencyContact;
    private String idCardNumber;
    private String address;
    private Long currentPropertyId;
    private Long currentRoomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private OccupancyStatus occupancyStatus;

    public TenantUpdateRequest() {}

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getIdCardNumber() { return idCardNumber; }
    public void setIdCardNumber(String idCardNumber) { this.idCardNumber = idCardNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Long getCurrentPropertyId() { return currentPropertyId; }
    public void setCurrentPropertyId(Long currentPropertyId) { this.currentPropertyId = currentPropertyId; }

    public Long getCurrentRoomId() { return currentRoomId; }
    public void setCurrentRoomId(Long currentRoomId) { this.currentRoomId = currentRoomId; }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public OccupancyStatus getOccupancyStatus() { return occupancyStatus; }
    public void setOccupancyStatus(OccupancyStatus occupancyStatus) { this.occupancyStatus = occupancyStatus; }
}
