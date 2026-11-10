package com.stayease.dto.report;

import java.util.List;
import java.util.Map;

public class MaintenanceReportDto {
    private long totalRequests;
    private long pendingRequests;
    private long inProgressRequests;
    private long completedRequests;
    private List<Map<String, Object>> categoryBreakdown;
    private List<Map<String, Object>> statusBreakdown;

    public MaintenanceReportDto() {}

    public long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }

    public long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(long pendingRequests) { this.pendingRequests = pendingRequests; }

    public long getInProgressRequests() { return inProgressRequests; }
    public void setInProgressRequests(long inProgressRequests) { this.inProgressRequests = inProgressRequests; }

    public long getCompletedRequests() { return completedRequests; }
    public void setCompletedRequests(long completedRequests) { this.completedRequests = completedRequests; }

    public List<Map<String, Object>> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<Map<String, Object>> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public List<Map<String, Object>> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(List<Map<String, Object>> statusBreakdown) { this.statusBreakdown = statusBreakdown; }
}
