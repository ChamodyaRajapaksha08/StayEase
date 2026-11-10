package com.stayease.dto.dashboard;

public class PublicStatsDto {
    private long totalProperties;
    private long activeTenants;

    public PublicStatsDto(long totalProperties, long activeTenants) {
        this.totalProperties = totalProperties;
        this.activeTenants = activeTenants;
    }

    public long getTotalProperties() { return totalProperties; }
    public void setTotalProperties(long totalProperties) { this.totalProperties = totalProperties; }

    public long getActiveTenants() { return activeTenants; }
    public void setActiveTenants(long activeTenants) { this.activeTenants = activeTenants; }
}
