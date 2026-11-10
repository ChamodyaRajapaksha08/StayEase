package com.stayease.repository;

import com.stayease.entity.Property;
import com.stayease.entity.enums.PropertyType;
import com.stayease.entity.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByOwnerId(Long ownerId);
    List<Property> findByStatus(UserStatus status);
    List<Property> findByType(PropertyType type);
    List<Property> findByCityIgnoreCase(String city);
    
    @Query("SELECT p FROM Property p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Property> searchProperties(@Param("keyword") String keyword);

    long countByStatus(UserStatus status);
    long countByOwnerId(Long ownerId);
}
