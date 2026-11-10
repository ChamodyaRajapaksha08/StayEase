package com.stayease.dto.dashboard;

import com.stayease.dto.finance.RentRecordDto;
import com.stayease.dto.finance.UtilityBillDto;
import com.stayease.dto.maintenance.MaintenanceRequestDto;
import com.stayease.dto.notification.NotificationDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.dto.room.RoomDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class TenantDashboardDto {
    private PropertyDto currentProperty;
    private RoomDto currentRoom;
    private BigDecimal monthlyRent;
    private String rentStatus;
    private LocalDate upcomingDueDate;
    private BigDecimal totalUnpaidBills;
    private long openMaintenanceCount;
    private List<RentRecordDto> recentRentRecords;
    private List<UtilityBillDto> pendingUtilityBills;
    private List<MaintenanceRequestDto> activeMaintenanceRequests;
    private List<NotificationDto> recentNotifications;

    public TenantDashboardDto() {}

    public PropertyDto getCurrentProperty() { return currentProperty; }
    public void setCurrentProperty(PropertyDto currentProperty) { this.currentProperty = currentProperty; }

    public RoomDto getCurrentRoom() { return currentRoom; }
    public void setCurrentRoom(RoomDto currentRoom) { this.currentRoom = currentRoom; }

    public BigDecimal getMonthlyRent() { return monthlyRent; }
    public void setMonthlyRent(BigDecimal monthlyRent) { this.monthlyRent = monthlyRent; }

    public String getRentStatus() { return rentStatus; }
    public void setRentStatus(String rentStatus) { this.rentStatus = rentStatus; }

    public LocalDate getUpcomingDueDate() { return upcomingDueDate; }
    public void setUpcomingDueDate(LocalDate upcomingDueDate) { this.upcomingDueDate = upcomingDueDate; }

    public BigDecimal getTotalUnpaidBills() { return totalUnpaidBills; }
    public void setTotalUnpaidBills(BigDecimal totalUnpaidBills) { this.totalUnpaidBills = totalUnpaidBills; }

    public long getOpenMaintenanceCount() { return openMaintenanceCount; }
    public void setOpenMaintenanceCount(long openMaintenanceCount) { this.openMaintenanceCount = openMaintenanceCount; }

    public List<RentRecordDto> getRecentRentRecords() { return recentRentRecords; }
    public void setRecentRentRecords(List<RentRecordDto> recentRentRecords) { this.recentRentRecords = recentRentRecords; }

    public List<UtilityBillDto> getPendingUtilityBills() { return pendingUtilityBills; }
    public void setPendingUtilityBills(List<UtilityBillDto> pendingUtilityBills) { this.pendingUtilityBills = pendingUtilityBills; }

    public List<MaintenanceRequestDto> getActiveMaintenanceRequests() { return activeMaintenanceRequests; }
    public void setActiveMaintenanceRequests(List<MaintenanceRequestDto> activeMaintenanceRequests) { this.activeMaintenanceRequests = activeMaintenanceRequests; }

    public List<NotificationDto> getRecentNotifications() { return recentNotifications; }
    public void setRecentNotifications(List<NotificationDto> recentNotifications) { this.recentNotifications = recentNotifications; }
}
