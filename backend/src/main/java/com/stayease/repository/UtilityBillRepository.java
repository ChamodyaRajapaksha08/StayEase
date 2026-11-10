package com.stayease.repository;

import com.stayease.entity.UtilityBill;
import com.stayease.entity.enums.RentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UtilityBillRepository extends JpaRepository<UtilityBill, Long> {
    List<UtilityBill> findByTenantIdOrderByDueDateDesc(Long tenantId);
    List<UtilityBill> findByPropertyIdOrderByDueDateDesc(Long propertyId);
    List<UtilityBill> findByPropertyOwnerIdOrderByDueDateDesc(Long ownerId);
    List<UtilityBill> findByStatusOrderByDueDateDesc(RentStatus status);
    List<UtilityBill> findByTenantIdAndStatus(Long tenantId, RentStatus status);
}
