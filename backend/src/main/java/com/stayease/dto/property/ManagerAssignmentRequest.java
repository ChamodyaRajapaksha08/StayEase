package com.stayease.dto.property;

import jakarta.validation.constraints.NotNull;

public class ManagerAssignmentRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Manager ID is required")
    private Long managerId;

    public ManagerAssignmentRequest() {}

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }
}
