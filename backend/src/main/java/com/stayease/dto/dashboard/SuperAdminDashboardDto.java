package com.stayease.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class SuperAdminDashboardDto {
    private long totalOwners;
    private long totalProperties;
    private long totalRegisteredUsers;
    private long totalActiveProperties;
    private long totalTenants;
    private long totalManagers;
    private BigDecimal platformRevenue;
    private List<Map<String, Object>> userDistribution;
    private List<Map<String, Object>> monthlyRegistrationTrends;

    public SuperAdminDashboardDto() {}

    public long getTotalOwners() { return totalOwners; }
    public void setTotalOwners(long totalOwners) { this.totalOwners = totalOwners; }

    public long getTotalProperties() { return totalProperties; }
    public void setTotalProperties(long totalProperties) { this.totalProperties = totalProperties; }

    public long getTotalRegisteredUsers() { return totalRegisteredUsers; }
    public void setTotalRegisteredUsers(long totalRegisteredUsers) { this.totalRegisteredUsers = totalRegisteredUsers; }

    public long getTotalActiveProperties() { return totalActiveProperties; }
    public void setTotalActiveProperties(long totalActiveProperties) { this.totalActiveProperties = totalActiveProperties; }

    public long getTotalTenants() { return totalTenants; }
    public void setTotalTenants(long totalTenants) { this.totalTenants = totalTenants; }

    public long getTotalManagers() { return totalManagers; }
    public void setTotalManagers(long totalManagers) { this.totalManagers = totalManagers; }

    public BigDecimal getPlatformRevenue() { return platformRevenue; }
    public void setPlatformRevenue(BigDecimal platformRevenue) { this.platformRevenue = platformRevenue; }

    public List<Map<String, Object>> getUserDistribution() { return userDistribution; }
    public void setUserDistribution(List<Map<String, Object>> userDistribution) { this.userDistribution = userDistribution; }

    public List<Map<String, Object>> getMonthlyRegistrationTrends() { return monthlyRegistrationTrends; }
    public void setMonthlyRegistrationTrends(List<Map<String, Object>> monthlyRegistrationTrends) { this.monthlyRegistrationTrends = monthlyRegistrationTrends; }
}
