package com.stayease.dto.finance;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.dto.room.RoomDto;
import com.stayease.entity.RentRecord;
import com.stayease.entity.enums.RentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class RentRecordDto {
    private Long id;
    private UserDto tenant;
    private PropertyDto property;
    private RoomDto room;
    private String billingMonth;
    private LocalDate dueDate;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private RentStatus status;
    private String notes;
    private LocalDateTime createdAt;

    public RentRecordDto() {}

    public static RentRecordDto fromEntity(RentRecord record) {
        if (record == null) return null;
        RentRecordDto dto = new RentRecordDto();
        dto.setId(record.getId());
        dto.setTenant(UserDto.fromEntity(record.getTenant()));
        dto.setProperty(PropertyDto.fromEntity(record.getProperty()));
        dto.setRoom(RoomDto.fromEntity(record.getRoom()));
        dto.setBillingMonth(record.getBillingMonth());
        dto.setDueDate(record.getDueDate());
        dto.setAmount(record.getAmount());
        dto.setPaidAmount(record.getPaidAmount());
        dto.setStatus(record.getStatus());
        dto.setNotes(record.getNotes());
        dto.setCreatedAt(record.getCreatedAt());
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

    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public RentStatus getStatus() { return status; }
    public void setStatus(RentStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
