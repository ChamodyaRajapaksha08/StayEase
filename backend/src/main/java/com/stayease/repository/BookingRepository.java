package com.stayease.repository;

import com.stayease.entity.Booking;
import com.stayease.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<Booking> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);
    List<Booking> findByPropertyOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    List<Booking> findByPropertyOwnerIdAndStatus(Long ownerId, BookingStatus status);
    
    long countByStatus(BookingStatus status);
    long countByPropertyOwnerIdAndStatus(Long ownerId, BookingStatus status);
    long countByPropertyIdAndStatus(Long propertyId, BookingStatus status);
}
