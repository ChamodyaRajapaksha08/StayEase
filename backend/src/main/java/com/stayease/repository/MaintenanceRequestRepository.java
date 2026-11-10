package com.stayease.repository;

import com.stayease.entity.MaintenanceRequest;
import com.stayease.entity.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByTenantIdOrderBySubmittedDateDesc(Long tenantId);
    List<MaintenanceRequest> findByPropertyIdOrderBySubmittedDateDesc(Long propertyId);
    List<MaintenanceRequest> findByPropertyOwnerIdOrderBySubmittedDateDesc(Long ownerId);
    List<MaintenanceRequest> findByStatusOrderBySubmittedDateDesc(MaintenanceStatus status);

    long countByStatus(MaintenanceStatus status);
    long countByPropertyOwnerIdAndStatus(Long ownerId, MaintenanceStatus status);
    long countByPropertyIdAndStatus(Long propertyId, MaintenanceStatus status);
}
