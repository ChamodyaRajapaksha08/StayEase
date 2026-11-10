package com.stayease.repository;

import com.stayease.entity.TenantProfile;
import com.stayease.entity.enums.OccupancyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantProfileRepository extends JpaRepository<TenantProfile, Long> {
    Optional<TenantProfile> findByUserId(Long userId);
    List<TenantProfile> findByCurrentPropertyId(Long propertyId);
    List<TenantProfile> findByCurrentPropertyOwnerId(Long ownerId);
    List<TenantProfile> findByOccupancyStatus(OccupancyStatus status);
    long countByOccupancyStatus(OccupancyStatus status);
    long countByCurrentPropertyOwnerIdAndOccupancyStatus(Long ownerId, OccupancyStatus status);
    long countByCurrentPropertyIdAndOccupancyStatus(Long propertyId, OccupancyStatus status);
}
