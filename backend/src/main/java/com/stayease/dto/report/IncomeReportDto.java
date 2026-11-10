package com.stayease.dto.report;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class IncomeReportDto {
    private BigDecimal totalRentCollected;
    private BigDecimal totalOutstandingRent;
    private BigDecimal totalUtilityCollected;
    private BigDecimal totalNetRevenue;
    private List<Map<String, Object>> monthlyBreakdown;
    private List<Map<String, Object>> propertyBreakdown;

    public IncomeReportDto() {}

    public BigDecimal getTotalRentCollected() { return totalRentCollected; }
    public void setTotalRentCollected(BigDecimal totalRentCollected) { this.totalRentCollected = totalRentCollected; }

    public BigDecimal getTotalOutstandingRent() { return totalOutstandingRent; }
    public void setTotalOutstandingRent(BigDecimal totalOutstandingRent) { this.totalOutstandingRent = totalOutstandingRent; }

    public BigDecimal getTotalUtilityCollected() { return totalUtilityCollected; }
    public void setTotalUtilityCollected(BigDecimal totalUtilityCollected) { this.totalUtilityCollected = totalUtilityCollected; }

    public BigDecimal getTotalNetRevenue() { return totalNetRevenue; }
    public void setTotalNetRevenue(BigDecimal totalNetRevenue) { this.totalNetRevenue = totalNetRevenue; }

    public List<Map<String, Object>> getMonthlyBreakdown() { return monthlyBreakdown; }
    public void setMonthlyBreakdown(List<Map<String, Object>> monthlyBreakdown) { this.monthlyBreakdown = monthlyBreakdown; }

    public List<Map<String, Object>> getPropertyBreakdown() { return propertyBreakdown; }
    public void setPropertyBreakdown(List<Map<String, Object>> propertyBreakdown) { this.propertyBreakdown = propertyBreakdown; }
}
