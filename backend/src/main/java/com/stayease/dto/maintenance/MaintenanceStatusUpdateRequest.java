package com.stayease.dto.maintenance;

import com.stayease.entity.enums.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;

public class MaintenanceStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private MaintenanceStatus status;

    private String resolutionNotes;

    public MaintenanceStatusUpdateRequest() {}

    public MaintenanceStatus getStatus() { return status; }
    public void setStatus(MaintenanceStatus status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
