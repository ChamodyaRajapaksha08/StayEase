package com.stayease.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class OwnerDashboardDto {
    private long totalProperties;
    private long totalRooms;
    private long availableRooms;
    private long occupiedRooms;
    private long activeTenants;
    private long pendingBookings;
    private BigDecimal monthlyIncome;
    private BigDecimal outstandingPayments;
    private long pendingMaintenanceRequests;
    private List<Map<String, Object>> revenueTrends;
    private List<Map<String, Object>> occupancyBreakdown;

    public OwnerDashboardDto() {}

    public long getTotalProperties() { return totalProperties; }
    public void setTotalProperties(long totalProperties) { this.totalProperties = totalProperties; }

    public long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }

    public long getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(long availableRooms) { this.availableRooms = availableRooms; }

    public long getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(long occupiedRooms) { this.occupiedRooms = occupiedRooms; }

    public long getActiveTenants() { return activeTenants; }
    public void setActiveTenants(long activeTenants) { this.activeTenants = activeTenants; }

    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long pendingBookings) { this.pendingBookings = pendingBookings; }

    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(BigDecimal monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public BigDecimal getOutstandingPayments() { return outstandingPayments; }
    public void setOutstandingPayments(BigDecimal outstandingPayments) { this.outstandingPayments = outstandingPayments; }

    public long getPendingMaintenanceRequests() { return pendingMaintenanceRequests; }
    public void setPendingMaintenanceRequests(long pendingMaintenanceRequests) { this.pendingMaintenanceRequests = pendingMaintenanceRequests; }

    public List<Map<String, Object>> getRevenueTrends() { return revenueTrends; }
    public void setRevenueTrends(List<Map<String, Object>> revenueTrends) { this.revenueTrends = revenueTrends; }

    public List<Map<String, Object>> getOccupancyBreakdown() { return occupancyBreakdown; }
    public void setOccupancyBreakdown(List<Map<String, Object>> occupancyBreakdown) { this.occupancyBreakdown = occupancyBreakdown; }
}
