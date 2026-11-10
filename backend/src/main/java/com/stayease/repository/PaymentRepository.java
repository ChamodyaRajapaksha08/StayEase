package com.stayease.repository;

import com.stayease.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTenantIdOrderByPaymentDateDesc(Long tenantId);
    List<Payment> findByPropertyIdOrderByPaymentDateDesc(Long propertyId);
    List<Payment> findByPropertyOwnerIdOrderByPaymentDateDesc(Long ownerId);
    Optional<Payment> findByReceiptNumber(String receiptNumber);
    boolean existsByReceiptNumber(String receiptNumber);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.property.owner.id = :ownerId AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumPaymentsByOwnerAndDateRange(@Param("ownerId") Long ownerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.property.id = :propertyId AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumPaymentsByPropertyAndDateRange(@Param("propertyId") Long propertyId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAllPaymentsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
