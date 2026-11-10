package com.stayease.dto.finance;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.entity.UtilityBill;
import com.stayease.entity.enums.RentStatus;
import com.stayease.entity.enums.UtilityBillType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UtilityBillDto {
    private Long id;
    private UserDto tenant;
    private PropertyDto property;
    private UtilityBillType billType;
    private String billingMonth;
    private BigDecimal previousReading;
    private BigDecimal currentReading;
    private BigDecimal unitRate;
    private BigDecimal amount;
    private LocalDate dueDate;
    private RentStatus status;
    private LocalDateTime createdAt;

    public UtilityBillDto() {}

    public static UtilityBillDto fromEntity(UtilityBill bill) {
        if (bill == null) return null;
        UtilityBillDto dto = new UtilityBillDto();
        dto.setId(bill.getId());
        dto.setTenant(UserDto.fromEntity(bill.getTenant()));
        dto.setProperty(PropertyDto.fromEntity(bill.getProperty()));
        dto.setBillType(bill.getBillType());
        dto.setBillingMonth(bill.getBillingMonth());
        dto.setPreviousReading(bill.getPreviousReading());
        dto.setCurrentReading(bill.getCurrentReading());
        dto.setUnitRate(bill.getUnitRate());
        dto.setAmount(bill.getAmount());
        dto.setDueDate(bill.getDueDate());
        dto.setStatus(bill.getStatus());
        dto.setCreatedAt(bill.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserDto getTenant() { return tenant; }
    public void setTenant(UserDto tenant) { this.tenant = tenant; }

    public PropertyDto getProperty() { return property; }
    public void setProperty(PropertyDto property) { this.property = property; }

    public UtilityBillType getBillType() { return billType; }
    public void setBillType(UtilityBillType billType) { this.billType = billType; }

    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }

    public BigDecimal getPreviousReading() { return previousReading; }
    public void setPreviousReading(BigDecimal previousReading) { this.previousReading = previousReading; }

    public BigDecimal getCurrentReading() { return currentReading; }
    public void setCurrentReading(BigDecimal currentReading) { this.currentReading = currentReading; }

    public BigDecimal getUnitRate() { return unitRate; }
    public void setUnitRate(BigDecimal unitRate) { this.unitRate = unitRate; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public RentStatus getStatus() { return status; }
    public void setStatus(RentStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
