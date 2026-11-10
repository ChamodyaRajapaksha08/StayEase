package com.stayease.repository;

import com.stayease.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByPropertyIdOrPropertyIsNullOrderByCreatedAtDesc(Long propertyId);
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
