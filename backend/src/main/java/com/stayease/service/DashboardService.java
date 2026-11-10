package com.stayease.service;

import com.stayease.dto.dashboard.*;
import com.stayease.dto.finance.RentRecordDto;
import com.stayease.dto.finance.UtilityBillDto;
import com.stayease.dto.maintenance.MaintenanceRequestDto;
import com.stayease.dto.notification.NotificationDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.dto.room.RoomDto;
import com.stayease.entity.*;
import com.stayease.entity.enums.*;
import com.stayease.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyManagerRepository propertyManagerRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final TenantProfileRepository tenantProfileRepository;
    private final RentRecordRepository rentRecordRepository;
    private final PaymentRepository paymentRepository;
    private final UtilityBillRepository utilityBillRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final NotificationRepository notificationRepository;

    public DashboardService(UserRepository userRepository,
                            PropertyRepository propertyRepository,
                            PropertyManagerRepository propertyManagerRepository,
                            RoomRepository roomRepository,
                            BookingRepository bookingRepository,
                            TenantProfileRepository tenantProfileRepository,
                            RentRecordRepository rentRecordRepository,
                            PaymentRepository paymentRepository,
                            UtilityBillRepository utilityBillRepository,
                            MaintenanceRequestRepository maintenanceRepository,
                            NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.propertyManagerRepository = propertyManagerRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.tenantProfileRepository = tenantProfileRepository;
        this.rentRecordRepository = rentRecordRepository;
        this.paymentRepository = paymentRepository;
        this.utilityBillRepository = utilityBillRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public SuperAdminDashboardDto getSuperAdminDashboard() {
        SuperAdminDashboardDto dto = new SuperAdminDashboardDto();
        dto.setTotalOwners(userRepository.countByRole(Role.OWNER));
        dto.setTotalTenants(userRepository.countByRole(Role.TENANT));
        dto.setTotalManagers(userRepository.countByRole(Role.MANAGER));
        dto.setTotalRegisteredUsers(userRepository.count());
        dto.setTotalProperties(propertyRepository.count());
        dto.setTotalActiveProperties(propertyRepository.countByStatus(UserStatus.ACTIVE));

        LocalDate startDate = LocalDate.now().minusMonths(6).withDayOfMonth(1);
        LocalDate endDate = LocalDate.now();
        dto.setPlatformRevenue(paymentRepository.sumAllPaymentsBetweenDates(startDate, endDate));

        List<Map<String, Object>> dist = new ArrayList<>();
        dist.add(Map.of("name", "Owners", "value", dto.getTotalOwners()));
        dist.add(Map.of("name", "Managers", "value", dto.getTotalManagers()));
        dist.add(Map.of("name", "Tenants", "value", dto.getTotalTenants()));
        dto.setUserDistribution(dist);

        List<Map<String, Object>> trends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate m = LocalDate.now().minusMonths(i);
            String monthLabel = m.format(DateTimeFormatter.ofPattern("MMM yyyy"));
            trends.add(Map.of(
                    "month", monthLabel,
                    "users", Math.max(1, (dto.getTotalRegisteredUsers() / 6) * (6 - i) / 3),
                    "properties", Math.max(1, (dto.getTotalProperties() / 4) * (6 - i) / 3)
            ));
        }
        dto.setMonthlyRegistrationTrends(trends);

        return dto;
    }

    @Transactional(readOnly = true)
    public OwnerDashboardDto getOwnerDashboard(Long ownerId) {
        OwnerDashboardDto dto = new OwnerDashboardDto();
        dto.setTotalProperties(propertyRepository.countByOwnerId(ownerId));
        dto.setTotalRooms(roomRepository.countByPropertyOwnerId(ownerId));
        dto.setAvailableRooms(roomRepository.countByPropertyOwnerIdAndAvailabilityStatus(ownerId, AvailabilityStatus.AVAILABLE));
        dto.setOccupiedRooms(roomRepository.countByPropertyOwnerIdAndAvailabilityStatus(ownerId, AvailabilityStatus.OCCUPIED));
        dto.setActiveTenants(tenantProfileRepository.countByCurrentPropertyOwnerIdAndOccupancyStatus(ownerId, OccupancyStatus.ACTIVE));
        dto.setPendingBookings(bookingRepository.countByPropertyOwnerIdAndStatus(ownerId, BookingStatus.PENDING));

        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        dto.setMonthlyIncome(rentRecordRepository.sumPaidRentByOwnerAndMonth(ownerId, currentMonth));
        dto.setOutstandingPayments(rentRecordRepository.sumOutstandingRentByOwner(ownerId));
        dto.setPendingMaintenanceRequests(maintenanceRepository.countByPropertyOwnerIdAndStatus(ownerId, MaintenanceStatus.SUBMITTED));

        // Revenue trends
        List<Map<String, Object>> revTrends = new ArrayList<>();
        for (int i = 4; i >= 0; i--) {
            LocalDate m = LocalDate.now().minusMonths(i);
            String monthStr = m.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String monthName = m.format(DateTimeFormatter.ofPattern("MMM"));
            BigDecimal income = rentRecordRepository.sumPaidRentByOwnerAndMonth(ownerId, monthStr);
            revTrends.add(Map.of("month", monthName, "revenue", income != null ? income : BigDecimal.ZERO));
        }
        dto.setRevenueTrends(revTrends);

        // Occupancy breakdown
        List<Map<String, Object>> occ = new ArrayList<>();
        occ.add(Map.of("name", "Occupied", "value", dto.getOccupiedRooms()));
        occ.add(Map.of("name", "Available", "value", dto.getAvailableRooms()));
        dto.setOccupancyBreakdown(occ);

        return dto;
    }

    @Transactional(readOnly = true)
    public ManagerDashboardDto getManagerDashboard(Long managerId) {
        ManagerDashboardDto dto = new ManagerDashboardDto();
        List<PropertyManager> pms = propertyManagerRepository.findByManagerId(managerId);
        List<Long> propIds = pms.stream().map(pm -> pm.getProperty().getId()).collect(Collectors.toList());

        dto.setAssignedPropertiesCount(pms.size());

        long activeTenants = 0;
        long availRooms = 0;
        long occRooms = 0;
        long pendBookings = 0;
        BigDecimal unpaid = BigDecimal.ZERO;
        long pendMaint = 0;

        List<Map<String, Object>> propOcc = new ArrayList<>();

        for (PropertyManager pm : pms) {
            Long pId = pm.getProperty().getId();
            activeTenants += tenantProfileRepository.countByCurrentPropertyIdAndOccupancyStatus(pId, OccupancyStatus.ACTIVE);
            long av = roomRepository.countByPropertyIdAndAvailabilityStatus(pId, AvailabilityStatus.AVAILABLE);
            long oc = roomRepository.countByPropertyIdAndAvailabilityStatus(pId, AvailabilityStatus.OCCUPIED);
            availRooms += av;
            occRooms += oc;
            pendBookings += bookingRepository.countByPropertyIdAndStatus(pId, BookingStatus.PENDING);
            BigDecimal pUnpaid = rentRecordRepository.sumOutstandingRentByProperty(pId);
            if (pUnpaid != null) unpaid = unpaid.add(pUnpaid);
            pendMaint += maintenanceRepository.countByPropertyIdAndStatus(pId, MaintenanceStatus.SUBMITTED);

            propOcc.add(Map.of(
                    "propertyName", pm.getProperty().getName(),
                    "occupied", oc,
                    "available", av
            ));
        }

        dto.setActiveTenants(activeTenants);
        dto.setAvailableRooms(availRooms);
        dto.setOccupiedRooms(occRooms);
        dto.setPendingBookings(pendBookings);
        dto.setUnpaidRent(unpaid);
        dto.setPendingMaintenanceRequests(pendMaint);
        dto.setPropertyOccupancy(propOcc);

        return dto;
    }

    @Transactional(readOnly = true)
    public TenantDashboardDto getTenantDashboard(Long tenantId) {
        TenantDashboardDto dto = new TenantDashboardDto();

        Optional<TenantProfile> optProfile = tenantProfileRepository.findByUserId(tenantId);
        if (optProfile.isPresent()) {
            TenantProfile profile = optProfile.get();
            if (profile.getCurrentProperty() != null) {
                dto.setCurrentProperty(PropertyDto.fromEntity(profile.getCurrentProperty()));
            }
            if (profile.getCurrentRoom() != null) {
                dto.setCurrentRoom(RoomDto.fromEntity(profile.getCurrentRoom()));
                dto.setMonthlyRent(profile.getCurrentRoom().getMonthlyRent());
            }
        }

        List<RentRecord> rents = rentRecordRepository.findByTenantIdOrderByDueDateDesc(tenantId);
        if (!rents.isEmpty()) {
            RentRecord latestRent = rents.get(0);
            dto.setRentStatus(latestRent.getStatus().name());
            dto.setUpcomingDueDate(latestRent.getDueDate());
        } else {
            dto.setRentStatus("NO_RECORDS");
        }
        dto.setRecentRentRecords(rents.stream().limit(5).map(RentRecordDto::fromEntity).collect(Collectors.toList()));

        List<UtilityBill> bills = utilityBillRepository.findByTenantIdAndStatus(tenantId, RentStatus.UNPAID);
        BigDecimal unpaidBillsSum = bills.stream().map(UtilityBill::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalUnpaidBills(unpaidBillsSum);
        dto.setPendingUtilityBills(bills.stream().map(UtilityBillDto::fromEntity).collect(Collectors.toList()));

        List<MaintenanceRequest> maintList = maintenanceRepository.findByTenantIdOrderBySubmittedDateDesc(tenantId);
        long openMaint = maintList.stream().filter(m -> m.getStatus() == MaintenanceStatus.SUBMITTED || m.getStatus() == MaintenanceStatus.IN_PROGRESS).count();
        dto.setOpenMaintenanceCount(openMaint);
        dto.setActiveMaintenanceRequests(maintList.stream().limit(5).map(MaintenanceRequestDto::fromEntity).collect(Collectors.toList()));

        List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(tenantId);
        dto.setRecentNotifications(notifs.stream().limit(5).map(NotificationDto::fromEntity).collect(Collectors.toList()));

        return dto;
    }
}
