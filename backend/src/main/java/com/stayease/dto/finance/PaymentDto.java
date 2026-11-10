package com.stayease.dto.finance;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.entity.Payment;
import com.stayease.entity.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PaymentDto {
    private Long id;
    private Long rentRecordId;
    private Long utilityBillId;
    private UserDto tenant;
    private PropertyDto property;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private String receiptNumber;
    private String notes;
    private UserDto recordedBy;
    private LocalDateTime createdAt;

    public PaymentDto() {}

    public static PaymentDto fromEntity(Payment payment) {
        if (payment == null) return null;
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        if (payment.getRentRecord() != null) {
            dto.setRentRecordId(payment.getRentRecord().getId());
        }
        if (payment.getUtilityBill() != null) {
            dto.setUtilityBillId(payment.getUtilityBill().getId());
        }
        dto.setTenant(UserDto.fromEntity(payment.getTenant()));
        dto.setProperty(PropertyDto.fromEntity(payment.getProperty()));
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setReferenceNumber(payment.getReferenceNumber());
        dto.setReceiptNumber(payment.getReceiptNumber());
        dto.setNotes(payment.getNotes());
        dto.setRecordedBy(UserDto.fromEntity(payment.getRecordedBy()));
        dto.setCreatedAt(payment.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRentRecordId() { return rentRecordId; }
    public void setRentRecordId(Long rentRecordId) { this.rentRecordId = rentRecordId; }

    public Long getUtilityBillId() { return utilityBillId; }
    public void setUtilityBillId(Long utilityBillId) { this.utilityBillId = utilityBillId; }

    public UserDto getTenant() { return tenant; }
    public void setTenant(UserDto tenant) { this.tenant = tenant; }

    public PropertyDto getProperty() { return property; }
    public void setProperty(PropertyDto property) { this.property = property; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public UserDto getRecordedBy() { return recordedBy; }
    public void setRecordedBy(UserDto recordedBy) { this.recordedBy = recordedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
