package com.stayease.service;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.dto.property.PropertyRequest;
import com.stayease.entity.Property;
import com.stayease.entity.PropertyManager;
import com.stayease.entity.User;
import com.stayease.entity.enums.AvailabilityStatus;
import com.stayease.entity.enums.Role;
import com.stayease.entity.enums.UserStatus;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.PropertyManagerRepository;
import com.stayease.repository.PropertyRepository;
import com.stayease.repository.RoomRepository;
import com.stayease.repository.UserRepository;
import com.stayease.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyManagerRepository propertyManagerRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    public PropertyService(PropertyRepository propertyRepository,
                           PropertyManagerRepository propertyManagerRepository,
                           UserRepository userRepository,
                           RoomRepository roomRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyManagerRepository = propertyManagerRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<PropertyDto> getPropertiesForUser(UserPrincipal principal, String keyword, String city) {
        List<Property> properties;

        if (principal == null) {
            properties = propertyRepository.findByStatus(UserStatus.ACTIVE);
        } else if (principal.getRole() == Role.SUPER_ADMIN) {
            properties = propertyRepository.findAll();
        } else if (principal.getRole() == Role.OWNER) {
            properties = propertyRepository.findByOwnerId(principal.getId());
        } else if (principal.getRole() == Role.MANAGER) {
            List<PropertyManager> pms = propertyManagerRepository.findByManagerIdAndStatus(principal.getId(), UserStatus.ACTIVE);
            properties = pms.stream().map(PropertyManager::getProperty).collect(Collectors.toList());
        } else {
            // TENANT
            properties = propertyRepository.findByStatus(UserStatus.ACTIVE);
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            String lower = keyword.toLowerCase().trim();
            properties = properties.stream().filter(p ->
                    p.getName().toLowerCase().contains(lower) ||
                    p.getCity().toLowerCase().contains(lower) ||
                    p.getAddress().toLowerCase().contains(lower)
            ).collect(Collectors.toList());
        }

        if (city != null && !city.trim().isEmpty()) {
            properties = properties.stream().filter(p ->
                    p.getCity().equalsIgnoreCase(city.trim())
            ).collect(Collectors.toList());
        }

        return properties.stream().map(this::enrichPropertyDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PropertyDto getPropertyById(Long id, UserPrincipal principal) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        verifyPropertyAccess(property, principal);
        return enrichPropertyDto(property);
    }

    @Transactional
    public PropertyDto createProperty(PropertyRequest req, UserPrincipal principal) {
        if (principal.getRole() != Role.OWNER && principal.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenException("Only property owners or administrators can register new properties.");
        }

        User owner = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        Property property = new Property();
        property.setName(req.getName());
        property.setType(req.getType());
        property.setDescription(req.getDescription());
        property.setAddress(req.getAddress());
        property.setCity(req.getCity());
        property.setContactNumber(req.getContactNumber());
        property.setImageUrl(req.getImageUrl());
        property.setOwner(owner);
        property.setStatus(req.getStatus() != null ? req.getStatus() : UserStatus.ACTIVE);

        Property saved = propertyRepository.save(property);
        return enrichPropertyDto(saved);
    }

    @Transactional
    public PropertyDto updateProperty(Long id, PropertyRequest req, UserPrincipal principal) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        if (principal.getRole() != Role.SUPER_ADMIN && !property.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to update this property.");
        }

        property.setName(req.getName());
        property.setType(req.getType());
        property.setDescription(req.getDescription());
        property.setAddress(req.getAddress());
        property.setCity(req.getCity());
        property.setContactNumber(req.getContactNumber());
        if (req.getImageUrl() != null) {
            property.setImageUrl(req.getImageUrl());
        }
        if (req.getStatus() != null) {
            property.setStatus(req.getStatus());
        }

        Property updated = propertyRepository.save(property);
        return enrichPropertyDto(updated);
    }

    @Transactional
    public void deleteProperty(Long id, UserPrincipal principal) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        if (principal.getRole() != Role.SUPER_ADMIN && !property.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to delete this property.");
        }

        long activeRooms = roomRepository.countByPropertyId(id);
        if (activeRooms > 0) {
            // Soft delete / deactivate to safeguard historical bookings and rent records
            property.setStatus(UserStatus.INACTIVE);
            propertyRepository.save(property);
        } else {
            propertyRepository.delete(property);
        }
    }

    @Transactional
    public void assignManager(Long propertyId, Long managerId, UserPrincipal principal) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        if (principal.getRole() != Role.SUPER_ADMIN && !property.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("Only the property owner can assign managers.");
        }

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));

        if (manager.getRole() != Role.MANAGER) {
            throw new BadRequestException("User does not have MANAGER role.");
        }

        if (propertyManagerRepository.existsByPropertyIdAndManagerId(propertyId, managerId)) {
            throw new BadRequestException("Manager is already assigned to this property.");
        }

        PropertyManager pm = new PropertyManager(property, manager);
        propertyManagerRepository.save(pm);
    }

    @Transactional
    public void removeManager(Long propertyId, Long managerId, UserPrincipal principal) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        if (principal.getRole() != Role.SUPER_ADMIN && !property.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("Only the property owner can remove managers.");
        }

        PropertyManager pm = propertyManagerRepository.findByPropertyIdAndManagerId(propertyId, managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for this property and manager."));

        propertyManagerRepository.delete(pm);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getManagersForProperty(Long propertyId, UserPrincipal principal) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        verifyPropertyAccess(property, principal);

        List<PropertyManager> pms = propertyManagerRepository.findByPropertyId(propertyId);
        return pms.stream().map(pm -> UserDto.fromEntity(pm.getManager())).collect(Collectors.toList());
    }

    public void verifyPropertyAccess(Property property, UserPrincipal principal) {
        if (principal == null || principal.getRole() == Role.TENANT) return;
        if (principal.getRole() == Role.SUPER_ADMIN) return;
        if (principal.getRole() == Role.OWNER) {
            if (!property.getOwner().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access denied: You do not own this property.");
            }
            return;
        }
        if (principal.getRole() == Role.MANAGER) {
            boolean isAssigned = propertyManagerRepository.existsByPropertyIdAndManagerId(property.getId(), principal.getId());
            if (!isAssigned) {
                throw new ForbiddenException("Access denied: You are not assigned to manage this property.");
            }
        }
    }

    private PropertyDto enrichPropertyDto(Property property) {
        PropertyDto dto = PropertyDto.fromEntity(property);
        int total = (int) roomRepository.countByPropertyId(property.getId());
        int available = (int) roomRepository.countByPropertyIdAndAvailabilityStatus(property.getId(), AvailabilityStatus.AVAILABLE);
        dto.setTotalRooms(total);
        dto.setAvailableRooms(available);
        return dto;
    }
}
