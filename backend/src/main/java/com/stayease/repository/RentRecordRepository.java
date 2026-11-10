package com.stayease.repository;

import com.stayease.entity.RentRecord;
import com.stayease.entity.enums.RentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentRecordRepository extends JpaRepository<RentRecord, Long> {
    List<RentRecord> findByTenantIdOrderByDueDateDesc(Long tenantId);
    List<RentRecord> findByPropertyIdOrderByDueDateDesc(Long propertyId);
    List<RentRecord> findByPropertyOwnerIdOrderByDueDateDesc(Long ownerId);
    List<RentRecord> findByStatusOrderByDueDateDesc(RentStatus status);
    List<RentRecord> findByTenantIdAndStatus(Long tenantId, RentStatus status);
    Optional<RentRecord> findByTenantIdAndRoomIdAndBillingMonth(Long tenantId, Long roomId, String billingMonth);

    @Query("SELECT COALESCE(SUM(r.paidAmount), 0) FROM RentRecord r WHERE r.property.owner.id = :ownerId AND r.billingMonth = :billingMonth")
    BigDecimal sumPaidRentByOwnerAndMonth(@Param("ownerId") Long ownerId, @Param("billingMonth") String billingMonth);

    @Query("SELECT COALESCE(SUM(r.amount - r.paidAmount), 0) FROM RentRecord r WHERE r.property.owner.id = :ownerId AND r.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE')")
    BigDecimal sumOutstandingRentByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COALESCE(SUM(r.paidAmount), 0) FROM RentRecord r WHERE r.property.id = :propertyId AND r.billingMonth = :billingMonth")
    BigDecimal sumPaidRentByPropertyAndMonth(@Param("propertyId") Long propertyId, @Param("billingMonth") String billingMonth);

    @Query("SELECT COALESCE(SUM(r.amount - r.paidAmount), 0) FROM RentRecord r WHERE r.property.id = :propertyId AND r.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE')")
    BigDecimal sumOutstandingRentByProperty(@Param("propertyId") Long propertyId);

    long countByPropertyOwnerIdAndStatus(Long ownerId, RentStatus status);
    long countByPropertyIdAndStatus(Long propertyId, RentStatus status);
}
