package com.stayease.service;

import com.stayease.dto.tenant.TenantDto;
import com.stayease.dto.tenant.TenantUpdateRequest;
import com.stayease.entity.Property;
import com.stayease.entity.PropertyManager;
import com.stayease.entity.Room;
import com.stayease.entity.TenantProfile;
import com.stayease.entity.enums.Role;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.PropertyManagerRepository;
import com.stayease.repository.PropertyRepository;
import com.stayease.repository.RoomRepository;
import com.stayease.repository.TenantProfileRepository;
import com.stayease.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TenantService {

    private final TenantProfileRepository tenantProfileRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final PropertyManagerRepository propertyManagerRepository;

    public TenantService(TenantProfileRepository tenantProfileRepository,
                         PropertyRepository propertyRepository,
                         RoomRepository roomRepository,
                         PropertyManagerRepository propertyManagerRepository) {
        this.tenantProfileRepository = tenantProfileRepository;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.propertyManagerRepository = propertyManagerRepository;
    }

    @Transactional(readOnly = true)
    public List<TenantDto> getTenants(UserPrincipal principal, Long propertyId) {
        List<TenantProfile> profiles;

        if (principal.getRole() == Role.SUPER_ADMIN) {
            profiles = tenantProfileRepository.findAll();
        } else if (principal.getRole() == Role.OWNER) {
            profiles = tenantProfileRepository.findByCurrentPropertyOwnerId(principal.getId());
        } else if (principal.getRole() == Role.MANAGER) {
            List<PropertyManager> pms = propertyManagerRepository.findByManagerId(principal.getId());
            List<Long> propIds = pms.stream().map(pm -> pm.getProperty().getId()).collect(Collectors.toList());
            profiles = tenantProfileRepository.findAll().stream()
                    .filter(tp -> tp.getCurrentProperty() != null && propIds.contains(tp.getCurrentProperty().getId()))
                    .collect(Collectors.toList());
        } else {
            // Tenant sees only their own profile
            profiles = tenantProfileRepository.findByUserId(principal.getId())
                    .map(List::of)
                    .orElse(List.of());
        }

        if (propertyId != null) {
            profiles = profiles.stream()
                    .filter(tp -> tp.getCurrentProperty() != null && tp.getCurrentProperty().getId().equals(propertyId))
                    .collect(Collectors.toList());
        }

        return profiles.stream().map(TenantDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TenantDto getTenantById(Long id, UserPrincipal principal) {
        TenantProfile profile = tenantProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant profile not found with id: " + id));

        verifyTenantAccess(profile, principal);
        return TenantDto.fromEntity(profile);
    }

    @Transactional(readOnly = true)
    public TenantDto getMyProfile(UserPrincipal principal) {
        TenantProfile profile = tenantProfileRepository.findByUserId(principal.getId())
                .orElseGet(() -> {
                    TenantProfile newProfile = new TenantProfile();
                    return newProfile;
                });
        return TenantDto.fromEntity(profile);
    }

    @Transactional
    public TenantDto updateTenant(Long id, TenantUpdateRequest req, UserPrincipal principal) {
        TenantProfile profile = tenantProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant profile not found with id: " + id));

        verifyTenantAccess(profile, principal);

        if (req.getEmergencyContact() != null) profile.setEmergencyContact(req.getEmergencyContact());
        if (req.getIdCardNumber() != null) profile.setIdCardNumber(req.getIdCardNumber());
        if (req.getAddress() != null) profile.setAddress(req.getAddress());
        if (req.getCheckInDate() != null) profile.setCheckInDate(req.getCheckInDate());
        if (req.getCheckOutDate() != null) profile.setCheckOutDate(req.getCheckOutDate());
        if (req.getOccupancyStatus() != null) profile.setOccupancyStatus(req.getOccupancyStatus());

        if (req.getCurrentPropertyId() != null) {
            Property prop = propertyRepository.findById(req.getCurrentPropertyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
            profile.setCurrentProperty(prop);
        }

        if (req.getCurrentRoomId() != null) {
            Room rm = roomRepository.findById(req.getCurrentRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
            profile.setCurrentRoom(rm);
        }

        TenantProfile saved = tenantProfileRepository.save(profile);
        return TenantDto.fromEntity(saved);
    }

    private void verifyTenantAccess(TenantProfile profile, UserPrincipal principal) {
        if (principal.getRole() == Role.SUPER_ADMIN) return;
        if (principal.getRole() == Role.TENANT) {
            if (!profile.getUser().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access denied: Not your profile.");
            }
            return;
        }
        if (principal.getRole() == Role.OWNER) {
            if (profile.getCurrentProperty() != null && !profile.getCurrentProperty().getOwner().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access denied: Tenant is not in your property.");
            }
            return;
        }
        if (principal.getRole() == Role.MANAGER) {
            if (profile.getCurrentProperty() != null) {
                boolean assigned = propertyManagerRepository.existsByPropertyIdAndManagerId(profile.getCurrentProperty().getId(), principal.getId());
                if (!assigned) {
                    throw new ForbiddenException("Access denied: Not assigned to manage this tenant's property.");
                }
            }
        }
    }
}
