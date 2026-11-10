package com.stayease.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ManagerDashboardDto {
    private long assignedPropertiesCount;
    private long activeTenants;
    private long availableRooms;
    private long occupiedRooms;
    private long pendingBookings;
    private BigDecimal unpaidRent;
    private long pendingMaintenanceRequests;
    private List<Map<String, Object>> propertyOccupancy;

    public ManagerDashboardDto() {}

    public long getAssignedPropertiesCount() { return assignedPropertiesCount; }
    public void setAssignedPropertiesCount(long assignedPropertiesCount) { this.assignedPropertiesCount = assignedPropertiesCount; }

    public long getActiveTenants() { return activeTenants; }
    public void setActiveTenants(long activeTenants) { this.activeTenants = activeTenants; }

    public long getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(long availableRooms) { this.availableRooms = availableRooms; }

    public long getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(long occupiedRooms) { this.occupiedRooms = occupiedRooms; }

    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long pendingBookings) { this.pendingBookings = pendingBookings; }

    public BigDecimal getUnpaidRent() { return unpaidRent; }
    public void setUnpaidRent(BigDecimal unpaidRent) { this.unpaidRent = unpaidRent; }

    public long getPendingMaintenanceRequests() { return pendingMaintenanceRequests; }
    public void setPendingMaintenanceRequests(long pendingMaintenanceRequests) { this.pendingMaintenanceRequests = pendingMaintenanceRequests; }

    public List<Map<String, Object>> getPropertyOccupancy() { return propertyOccupancy; }
    public void setPropertyOccupancy(List<Map<String, Object>> propertyOccupancy) { this.propertyOccupancy = propertyOccupancy; }
}
