package com.stayease.repository;

import com.stayease.entity.PropertyManager;
import com.stayease.entity.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyManagerRepository extends JpaRepository<PropertyManager, Long> {
    List<PropertyManager> findByManagerId(Long managerId);
    List<PropertyManager> findByManagerIdAndStatus(Long managerId, UserStatus status);
    List<PropertyManager> findByPropertyId(Long propertyId);
    Optional<PropertyManager> findByPropertyIdAndManagerId(Long propertyId, Long managerId);
    boolean existsByPropertyIdAndManagerId(Long propertyId, Long managerId);
    void deleteByPropertyIdAndManagerId(Long propertyId, Long managerId);
}
