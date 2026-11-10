package com.stayease.repository;

import com.stayease.entity.Room;
import com.stayease.entity.enums.AvailabilityStatus;
import com.stayease.entity.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByPropertyId(Long propertyId);
    List<Room> findByPropertyIdAndAvailabilityStatus(Long propertyId, AvailabilityStatus status);
    List<Room> findByPropertyOwnerId(Long ownerId);
    Optional<Room> findByPropertyIdAndRoomNumber(Long propertyId, String roomNumber);
    long countByPropertyId(Long propertyId);
    long countByPropertyIdAndAvailabilityStatus(Long propertyId, AvailabilityStatus status);
    long countByPropertyOwnerId(Long ownerId);
    long countByPropertyOwnerIdAndAvailabilityStatus(Long ownerId, AvailabilityStatus status);

    @Query("SELECT r FROM Room r WHERE r.property.id = :propertyId " +
           "AND (:roomType IS NULL OR r.roomType = :roomType) " +
           "AND (:status IS NULL OR r.availabilityStatus = :status) " +
           "AND (:maxRent IS NULL OR r.monthlyRent <= :maxRent)")
    List<Room> filterRooms(@Param("propertyId") Long propertyId,
                           @Param("roomType") RoomType roomType,
                           @Param("status") AvailabilityStatus status,
                           @Param("maxRent") BigDecimal maxRent);
}
