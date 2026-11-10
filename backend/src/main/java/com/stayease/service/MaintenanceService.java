package com.stayease.service;

import com.stayease.dto.maintenance.MaintenanceCreateRequest;
import com.stayease.dto.maintenance.MaintenanceRequestDto;
import com.stayease.dto.maintenance.MaintenanceStatusUpdateRequest;
import com.stayease.entity.*;
import com.stayease.entity.enums.MaintenanceStatus;
import com.stayease.entity.enums.NotificationType;
import com.stayease.entity.enums.Role;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.*;
import com.stayease.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final PropertyManagerRepository propertyManagerRepository;
    private final NotificationService notificationService;

    public MaintenanceService(MaintenanceRequestRepository maintenanceRepository,
                              PropertyRepository propertyRepository,
                              RoomRepository roomRepository,
                              UserRepository userRepository,
                              PropertyManagerRepository propertyManagerRepository,
                              NotificationService notificationService) {
        this.maintenanceRepository = maintenanceRepository;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.propertyManagerRepository = propertyManagerRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public MaintenanceRequestDto createRequest(MaintenanceCreateRequest req, UserPrincipal principal) {
        User tenant = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + req.getPropertyId()));

        Room room = null;
        if (req.getRoomId() != null) {
            room = roomRepository.findById(req.getRoomId()).orElse(null);
        }

        MaintenanceRequest request = new MaintenanceRequest();
        request.setTenant(tenant);
        request.setProperty(property);
        request.setRoom(room);
        request.setCategory(req.getCategory());
        request.setDescription(req.getDescription());
        request.setImageUrl(req.getImageUrl());
        request.setStatus(MaintenanceStatus.SUBMITTED);
        request.setSubmittedDate(LocalDateTime.now());

        MaintenanceRequest saved = maintenanceRepository.save(request);

        // Notify property owner
        notificationService.sendNotification(
                property.getOwner().getId(),
                "New Maintenance Request",
                "New " + req.getCategory() + " request submitted by " + tenant.getFullName() + " for " + property.getName() + ".",
                NotificationType.MAINTENANCE,
                saved.getId()
        );

        // Notify assigned managers
        List<PropertyManager> pms = propertyManagerRepository.findByPropertyId(property.getId());
        for (PropertyManager pm : pms) {
            notificationService.sendNotification(
                    pm.getManager().getId(),
                    "New Maintenance Request",
                    "New " + req.getCategory() + " request submitted by " + tenant.getFullName() + " for " + property.getName() + ".",
                    NotificationType.MAINTENANCE,
                    saved.getId()
            );
        }

        return MaintenanceRequestDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRequestDto> getRequests(UserPrincipal principal, Long propertyId, MaintenanceStatus status) {
        List<MaintenanceRequest> list;

        if (principal.getRole() == Role.SUPER_ADMIN) {
            list = (status != null) ? maintenanceRepository.findByStatusOrderBySubmittedDateDesc(status) : maintenanceRepository.findAll();
        } else if (principal.getRole() == Role.OWNER) {
            list = maintenanceRepository.findByPropertyOwnerIdOrderBySubmittedDateDesc(principal.getId());
        } else if (principal.getRole() == Role.MANAGER) {
            List<PropertyManager> pms = propertyManagerRepository.findByManagerId(principal.getId());
            List<Long> propIds = pms.stream().map(pm -> pm.getProperty().getId()).collect(Collectors.toList());
            list = maintenanceRepository.findAll().stream()
                    .filter(m -> propIds.contains(m.getProperty().getId()))
                    .collect(Collectors.toList());
        } else {
            list = maintenanceRepository.findByTenantIdOrderBySubmittedDateDesc(principal.getId());
        }

        if (propertyId != null) {
            list = list.stream().filter(m -> m.getProperty().getId().equals(propertyId)).collect(Collectors.toList());
        }

        if (status != null) {
            list = list.stream().filter(m -> m.getStatus() == status).collect(Collectors.toList());
        }

        return list.stream().map(MaintenanceRequestDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MaintenanceRequestDto getRequestById(Long id, UserPrincipal principal) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));

        verifyMaintenanceAccess(request, principal);
        return MaintenanceRequestDto.fromEntity(request);
    }

    @Transactional
    public MaintenanceRequestDto updateRequestStatus(Long id, MaintenanceStatusUpdateRequest req, UserPrincipal principal) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));

        verifyMaintenanceAccess(request, principal);

        request.setStatus(req.getStatus());
        if (req.getResolutionNotes() != null) {
            request.setResolutionNotes(req.getResolutionNotes());
        }
        if (req.getStatus() == MaintenanceStatus.COMPLETED) {
            request.setResolvedDate(LocalDateTime.now());
        }

        MaintenanceRequest saved = maintenanceRepository.save(request);

        notificationService.sendNotification(
                request.getTenant().getId(),
                "Maintenance Status Updated",
                "Your " + request.getCategory() + " maintenance request status is now: " + req.getStatus() + ".",
                NotificationType.MAINTENANCE,
                saved.getId()
        );

        return MaintenanceRequestDto.fromEntity(saved);
    }

    private void verifyMaintenanceAccess(MaintenanceRequest request, UserPrincipal principal) {
        if (principal.getRole() == Role.SUPER_ADMIN) return;
        if (principal.getRole() == Role.TENANT) {
            if (!request.getTenant().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access denied: Not your maintenance request.");
            }
            return;
        }
        if (principal.getRole() == Role.OWNER) {
            if (!request.getProperty().getOwner().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access denied: Not your property.");
            }
            return;
        }
        if (principal.getRole() == Role.MANAGER) {
            boolean assigned = propertyManagerRepository.existsByPropertyIdAndManagerId(request.getProperty().getId(), principal.getId());
            if (!assigned) {
                throw new ForbiddenException("Access denied: Not assigned to manage this property.");
            }
        }
    }
}
