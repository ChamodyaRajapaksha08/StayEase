package com.stayease.service;

import com.stayease.dto.announcement.AnnouncementDto;
import com.stayease.dto.announcement.AnnouncementRequest;
import com.stayease.entity.Announcement;
import com.stayease.entity.Property;
import com.stayease.entity.User;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.AnnouncementRepository;
import com.stayease.repository.PropertyRepository;
import com.stayease.repository.UserRepository;
import com.stayease.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               PropertyRepository propertyRepository,
                               UserRepository userRepository) {
        this.announcementRepository = announcementRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncements(Long propertyId) {
        List<Announcement> list;
        if (propertyId != null) {
            list = announcementRepository.findByPropertyIdOrPropertyIsNullOrderByCreatedAtDesc(propertyId);
        } else {
            list = announcementRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(AnnouncementDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementRequest req, UserPrincipal principal) {
        User author = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        Property property = null;
        if (req.getPropertyId() != null) {
            property = propertyRepository.findById(req.getPropertyId()).orElse(null);
        }

        Announcement ann = new Announcement();
        ann.setAuthor(author);
        ann.setProperty(property);
        ann.setTitle(req.getTitle());
        ann.setContent(req.getContent());
        ann.setTargetRole(req.getTargetRole() != null ? req.getTargetRole() : "ALL");

        Announcement saved = announcementRepository.save(ann);
        return AnnouncementDto.fromEntity(saved);
    }
}
