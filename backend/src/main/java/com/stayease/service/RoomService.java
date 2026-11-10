package com.stayease.service;

import com.stayease.dto.room.RoomDto;
import com.stayease.dto.room.RoomRequest;
import com.stayease.entity.Property;
import com.stayease.entity.Room;
import com.stayease.entity.enums.AvailabilityStatus;
import com.stayease.entity.enums.RoomType;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.PropertyRepository;
import com.stayease.repository.RoomRepository;
import com.stayease.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;

    public RoomService(RoomRepository roomRepository,
                       PropertyRepository propertyRepository,
                       PropertyService propertyService) {
        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
        this.propertyService = propertyService;
    }

    @Transactional(readOnly = true)
    public List<RoomDto> getRooms(Long propertyId, RoomType roomType, AvailabilityStatus status, BigDecimal maxRent) {
        List<Room> rooms;
        if (propertyId != null) {
            rooms = roomRepository.filterRooms(propertyId, roomType, status, maxRent);
        } else {
            rooms = roomRepository.findAll();
            if (roomType != null) {
                rooms = rooms.stream().filter(r -> r.getRoomType() == roomType).collect(Collectors.toList());
            }
            if (status != null) {
                rooms = rooms.stream().filter(r -> r.getAvailabilityStatus() == status).collect(Collectors.toList());
            }
            if (maxRent != null) {
                rooms = rooms.stream().filter(r -> r.getMonthlyRent().compareTo(maxRent) <= 0).collect(Collectors.toList());
            }
        }
        return rooms.stream().map(RoomDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomDto getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return RoomDto.fromEntity(room);
    }

    @Transactional
    public RoomDto createRoom(RoomRequest req, UserPrincipal principal) {
        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + req.getPropertyId()));

        propertyService.verifyPropertyAccess(property, principal);

        if (roomRepository.findByPropertyIdAndRoomNumber(property.getId(), req.getRoomNumber()).isPresent()) {
            throw new BadRequestException("Room number '" + req.getRoomNumber() + "' already exists in this property.");
        }

        Room room = new Room();
        room.setProperty(property);
        room.setRoomNumber(req.getRoomNumber());
        room.setRoomType(req.getRoomType());
        room.setCapacity(req.getCapacity());
        room.setAvailableBeds(req.getAvailableBeds() != null ? req.getAvailableBeds() : req.getCapacity());
        room.setMonthlyRent(req.getMonthlyRent());
        room.setFacilities(req.getFacilities());
        room.setImageUrl(req.getImageUrl());
        if (req.getAvailabilityStatus() != null) {
            room.setAvailabilityStatus(req.getAvailabilityStatus());
        }

        Room saved = roomRepository.save(room);
        return RoomDto.fromEntity(saved);
    }

    @Transactional
    public RoomDto updateRoom(Long id, RoomRequest req, UserPrincipal principal) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        propertyService.verifyPropertyAccess(room.getProperty(), principal);

        room.setRoomNumber(req.getRoomNumber());
        room.setRoomType(req.getRoomType());
        room.setCapacity(req.getCapacity());
        room.setAvailableBeds(req.getAvailableBeds());
        room.setMonthlyRent(req.getMonthlyRent());
        room.setFacilities(req.getFacilities());
        if (req.getImageUrl() != null) {
            room.setImageUrl(req.getImageUrl());
        }
        if (req.getAvailabilityStatus() != null) {
            room.setAvailabilityStatus(req.getAvailabilityStatus());
        }

        Room updated = roomRepository.save(room);
        return RoomDto.fromEntity(updated);
    }

    @Transactional
    public void deleteRoom(Long id, UserPrincipal principal) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        propertyService.verifyPropertyAccess(room.getProperty(), principal);
        roomRepository.delete(room);
    }
}
