package com.stayease.dto.report;

import java.util.List;
import java.util.Map;

public class OccupancyReportDto {
    private long totalRooms;
    private long occupiedRooms;
    private long availableRooms;
    private double overallOccupancyRate;
    private List<Map<String, Object>> propertyOccupancyRates;
    private List<Map<String, Object>> roomTypeDistribution;

    public OccupancyReportDto() {}

    public long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }

    public long getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(long occupiedRooms) { this.occupiedRooms = occupiedRooms; }

    public long getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(long availableRooms) { this.availableRooms = availableRooms; }

    public double getOverallOccupancyRate() { return overallOccupancyRate; }
    public void setOverallOccupancyRate(double overallOccupancyRate) { this.overallOccupancyRate = overallOccupancyRate; }

    public List<Map<String, Object>> getPropertyOccupancyRates() { return propertyOccupancyRates; }
    public void setPropertyOccupancyRates(List<Map<String, Object>> propertyOccupancyRates) { this.propertyOccupancyRates = propertyOccupancyRates; }

    public List<Map<String, Object>> getRoomTypeDistribution() { return roomTypeDistribution; }
    public void setRoomTypeDistribution(List<Map<String, Object>> roomTypeDistribution) { this.roomTypeDistribution = roomTypeDistribution; }
}
