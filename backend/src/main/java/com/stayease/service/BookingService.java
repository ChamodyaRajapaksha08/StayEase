package com.stayease.service;

import com.stayease.dto.booking.BookingDto;
import com.stayease.dto.booking.BookingRequest;
import com.stayease.dto.booking.BookingStatusUpdateRequest;
import com.stayease.entity.*;
import com.stayease.entity.enums.AvailabilityStatus;
import com.stayease.entity.enums.BookingStatus;
import com.stayease.entity.enums.NotificationType;
import com.stayease.entity.enums.OccupancyStatus;
import com.stayease.entity.enums.RentStatus;
import com.stayease.entity.enums.Role;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ForbiddenException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.*;
import com.stayease.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final TenantProfileRepository tenantProfileRepository;
    private final RentRecordRepository rentRecordRepository;
    private final PropertyManagerRepository propertyManagerRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          PropertyRepository propertyRepository,
                          RoomRepository roomRepository,
                          UserRepository userRepository,
                          TenantProfileRepository tenantProfileRepository,
                          RentRecordRepository rentRecordRepository,
                          PropertyManagerRepository propertyManagerRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.tenantProfileRepository = tenantProfileRepository;
        this.rentRecordRepository = rentRecordRepository;
        this.propertyManagerRepository = propertyManagerRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingDto createBooking(BookingRequest req, UserPrincipal principal) {
        User tenant = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + req.getPropertyId()));

        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + req.getRoomId()));

        if (!room.getProperty().getId().equals(property.getId())) {
            throw new BadRequestException("Room does not belong to the selected property.");
        }

        if (room.getAvailableBeds() <= 0 || room.getAvailabilityStatus() != AvailabilityStatus.AVAILABLE) {
            throw new BadRequestException("This room currently has no available beds for booking.");
        }

        Booking booking = new Booking();
        booking.setTenant(tenant);
        booking.setProperty(property);
        booking.setRoom(room);
        booking.setCheckInDate(req.getCheckInDate());
        booking.setCheckOutDate(req.getCheckOutDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setNotes(req.getNotes());

        Booking saved = bookingRepository.save(booking);

        // Notify property owner
        notificationService.sendNotification(
                property.getOwner().getId(),
                "New Booking Request",
                "New booking request received for " + property.getName() + " (Room " + room.getRoomNumber() + ") from " + tenant.getFullName() + ".",
                NotificationType.BOOKING,
                saved.getId()
        );

        // Notify managers assigned
        List<PropertyManager> managers = propertyManagerRepository.findByPropertyId(property.getId());
        for (PropertyManager pm : managers) {
            notificationService.sendNotification(
                    pm.getManager().getId(),
                    "New Booking Request",
                    "New booking request received for " + property.getName() + " (Room " + room.getRoomNumber() + ") from " + tenant.getFullName() + ".",
                    NotificationType.BOOKING,
                    saved.getId()
            );
        }

        return BookingDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getBookings(UserPrincipal principal, BookingStatus status) {
        List<Booking> bookings;

        if (principal.getRole() == Role.SUPER_ADMIN) {
            bookings = (status != null) ? bookingRepository.findByStatusOrderByCreatedAtDesc(status) : bookingRepository.findAll();
        } else if (principal.getRole() == Role.OWNER) {
            bookings = (status != null)
                    ? bookingRepository.findByPropertyOwnerIdAndStatus(principal.getId(), status)
                    : bookingRepository.findByPropertyOwnerIdOrderByCreatedAtDesc(principal.getId());
        } else if (principal.getRole() == Role.MANAGER) {
            List<PropertyManager> pms = propertyManagerRepository.findByManagerId(principal.getId());
            List<Long> propIds = pms.stream().map(pm -> pm.getProperty().getId()).collect(Collectors.toList());
            bookings = bookingRepository.findAll().stream()
                    .filter(b -> propIds.contains(b.getProperty().getId()))
                    .filter(b -> status == null || b.getStatus() == status)
                    .collect(Collectors.toList());
        } else {
            // TENANT
            bookings = bookingRepository.findByTenantIdOrderByCreatedAtDesc(principal.getId());
            if (status != null) {
                bookings = bookings.stream().filter(b -> b.getStatus() == status).collect(Collectors.toList());
            }
        }

        return bookings.stream().map(BookingDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long id, UserPrincipal principal) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        verifyBookingAccess(booking, principal);
        return BookingDto.fromEntity(booking);
    }

    @Transactional
    public BookingDto updateBookingStatus(Long id, BookingStatusUpdateRequest req, UserPrincipal principal) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (principal.getRole() == Role.TENANT) {
            if (!booking.getTenant().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access denied.");
            }
            if (req.getStatus() != BookingStatus.CANCELLED) {
                throw new ForbiddenException("Tenants may only cancel their bookings.");
            }
        } else {
            // Owner / Manager verification
            verifyBookingAccess(booking, principal);
        }

        BookingStatus oldStatus = booking.getStatus();
        BookingStatus newStatus = req.getStatus();

        if (oldStatus == newStatus) {
            return BookingDto.fromEntity(booking);
        }

        Room room = booking.getRoom();

        if (newStatus == BookingStatus.APPROVED) {
            if (room.getAvailableBeds() <= 0) {
                throw new BadRequestException("Room has no available beds remaining.");
            }

            room.setAvailableBeds(room.getAvailableBeds() - 1);
            roomRepository.save(room);

            // Update Tenant Profile
            TenantProfile profile = tenantProfileRepository.findByUserId(booking.getTenant().getId())
                    .orElseGet(() -> new TenantProfile(booking.getTenant()));
            profile.setCurrentProperty(booking.getProperty());
            profile.setCurrentRoom(room);
            profile.setCheckInDate(booking.getCheckInDate());
            profile.setOccupancyStatus(OccupancyStatus.ACTIVE);
            tenantProfileRepository.save(profile);

            // Generate first rent record
            String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            if (rentRecordRepository.findByTenantIdAndRoomIdAndBillingMonth(booking.getTenant().getId(), room.getId(), currentMonth).isEmpty()) {
                RentRecord rentRecord = new RentRecord();
                rentRecord.setTenant(booking.getTenant());
                rentRecord.setProperty(booking.getProperty());
                rentRecord.setRoom(room);
                rentRecord.setBillingMonth(currentMonth);
                rentRecord.setDueDate(LocalDate.now().plusDays(5));
                rentRecord.setAmount(room.getMonthlyRent());
                rentRecord.setStatus(RentStatus.UNPAID);
                rentRecord.setNotes("First month rent generated upon booking approval");
                rentRecordRepository.save(rentRecord);
            }

            notificationService.sendNotification(
                    booking.getTenant().getId(),
                    "Booking Approved!",
                    "Your booking request for " + booking.getProperty().getName() + " (Room " + room.getRoomNumber() + ") has been approved.",
                    NotificationType.BOOKING,
                    booking.getId()
            );

        } else if (oldStatus == BookingStatus.APPROVED && (newStatus == BookingStatus.CANCELLED || newStatus == BookingStatus.REJECTED || newStatus == BookingStatus.COMPLETED)) {
            // Restore bed
            room.setAvailableBeds(Math.min(room.getCapacity(), room.getAvailableBeds() + 1));
            roomRepository.save(room);

            notificationService.sendNotification(
                    booking.getTenant().getId(),
                    "Booking " + newStatus,
                    "Your booking request for " + booking.getProperty().getName() + " status updated to " + newStatus + ".",
                    NotificationType.BOOKING,
                    booking.getId()
            );
        } else if (newStatus == BookingStatus.REJECTED) {
            notificationService.sendNotification(
                    booking.getTenant().getId(),
                    "Booking Rejected",
                    "Your booking request for " + booking.getProperty().getName() + " has been declined.",
                    NotificationType.BOOKING,
                    booking.getId()
            );
        }

        booking.setStatus(newStatus);
        if (req.getNotes() != null) {
            booking.setNotes(req.getNotes());
        }

        Booking saved = bookingRepository.save(booking);
        return BookingDto.fromEntity(saved);
    }

    private void verifyBookingAccess(Booking booking, UserPrincipal principal) {
        if (principal.getRole() == Role.SUPER_ADMIN) return;
        if (principal.getRole() == Role.TENANT) {
            if (!booking.getTenant().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access denied: Not your booking.");
            }
            return;
        }
        if (principal.getRole() == Role.OWNER) {
            if (!booking.getProperty().getOwner().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access denied: Not your property.");
            }
            return;
        }
        if (principal.getRole() == Role.MANAGER) {
            boolean assigned = propertyManagerRepository.existsByPropertyIdAndManagerId(booking.getProperty().getId(), principal.getId());
            if (!assigned) {
                throw new ForbiddenException("Access denied: Not assigned to manage this property.");
            }
        }
    }
}
