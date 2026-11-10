package com.stayease.service;

import com.stayease.dto.report.IncomeReportDto;
import com.stayease.dto.report.MaintenanceReportDto;
import com.stayease.dto.report.OccupancyReportDto;
import com.stayease.entity.Payment;
import com.stayease.entity.Property;
import com.stayease.entity.RentRecord;
import com.stayease.entity.Room;
import com.stayease.entity.enums.AvailabilityStatus;
import com.stayease.entity.enums.MaintenanceCategory;
import com.stayease.entity.enums.MaintenanceStatus;
import com.stayease.entity.enums.Role;
import com.stayease.repository.*;
import com.stayease.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final RentRecordRepository rentRecordRepository;
    private final PaymentRepository paymentRepository;
    private final UtilityBillRepository utilityBillRepository;
    private final MaintenanceRequestRepository maintenanceRepository;

    public ReportService(PropertyRepository propertyRepository,
                         RoomRepository roomRepository,
                         RentRecordRepository rentRecordRepository,
                         PaymentRepository paymentRepository,
                         UtilityBillRepository utilityBillRepository,
                         MaintenanceRequestRepository maintenanceRepository) {
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.rentRecordRepository = rentRecordRepository;
        this.paymentRepository = paymentRepository;
        this.utilityBillRepository = utilityBillRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Transactional(readOnly = true)
    public IncomeReportDto getIncomeReport(UserPrincipal principal, Long propertyId, LocalDate startDate, LocalDate endDate) {
        IncomeReportDto dto = new IncomeReportDto();
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusMonths(6).withDayOfMonth(1);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        List<Payment> payments = (propertyId != null)
                ? paymentRepository.findByPropertyIdOrderByPaymentDateDesc(propertyId)
                : (principal.getRole() == Role.OWNER)
                    ? paymentRepository.findByPropertyOwnerIdOrderByPaymentDateDesc(principal.getId())
                    : paymentRepository.findAll();

        payments = payments.stream()
                .filter(p -> !p.getPaymentDate().isBefore(start) && !p.getPaymentDate().isAfter(end))
                .collect(Collectors.toList());

        BigDecimal rentCollected = payments.stream()
                .filter(p -> p.getRentRecord() != null)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal utilityCollected = payments.stream()
                .filter(p -> p.getUtilityBill() != null)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setTotalRentCollected(rentCollected);
        dto.setTotalUtilityCollected(utilityCollected);
        dto.setTotalNetRevenue(total);

        // Calculate outstanding rent
        List<RentRecord> rents = (propertyId != null)
                ? rentRecordRepository.findByPropertyIdOrderByDueDateDesc(propertyId)
                : (principal.getRole() == Role.OWNER)
                    ? rentRecordRepository.findByPropertyOwnerIdOrderByDueDateDesc(principal.getId())
                    : rentRecordRepository.findAll();

        BigDecimal outstanding = rents.stream()
                .map(r -> r.getAmount().subtract(r.getPaidAmount()))
                .filter(rem -> rem.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalOutstandingRent(outstanding);

        // Monthly breakdown
        Map<String, BigDecimal> monthMap = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            String m = LocalDate.now().minusMonths(i).format(DateTimeFormatter.ofPattern("MMM yyyy"));
            monthMap.put(m, BigDecimal.ZERO);
        }
        for (Payment p : payments) {
            String m = p.getPaymentDate().format(DateTimeFormatter.ofPattern("MMM yyyy"));
            if (monthMap.containsKey(m)) {
                monthMap.put(m, monthMap.get(m).add(p.getAmount()));
            }
        }
        List<Map<String, Object>> mList = monthMap.entrySet().stream()
                .map(e -> Map.<String, Object>of("month", e.getKey(), "amount", e.getValue()))
                .collect(Collectors.toList());
        dto.setMonthlyBreakdown(mList);

        // Property breakdown
        Map<String, BigDecimal> propMap = new HashMap<>();
        for (Payment p : payments) {
            String propName = p.getProperty().getName();
            propMap.put(propName, propMap.getOrDefault(propName, BigDecimal.ZERO).add(p.getAmount()));
        }
        List<Map<String, Object>> pList = propMap.entrySet().stream()
                .map(e -> Map.<String, Object>of("property", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList());
        dto.setPropertyBreakdown(pList);

        return dto;
    }

    @Transactional(readOnly = true)
    public OccupancyReportDto getOccupancyReport(UserPrincipal principal, Long propertyId) {
        OccupancyReportDto dto = new OccupancyReportDto();

        List<Room> rooms = (propertyId != null)
                ? roomRepository.findByPropertyId(propertyId)
                : (principal.getRole() == Role.OWNER)
                    ? roomRepository.findByPropertyOwnerId(principal.getId())
                    : roomRepository.findAll();

        long total = rooms.size();
        long occupied = rooms.stream().filter(r -> r.getAvailabilityStatus() == AvailabilityStatus.OCCUPIED).count();
        long available = rooms.stream().filter(r -> r.getAvailabilityStatus() == AvailabilityStatus.AVAILABLE).count();

        dto.setTotalRooms(total);
        dto.setOccupiedRooms(occupied);
        dto.setAvailableRooms(available);
        dto.setOverallOccupancyRate(total > 0 ? ((double) occupied / total) * 100.0 : 0.0);

        // Property breakdown
        List<Property> properties = (principal.getRole() == Role.OWNER)
                ? propertyRepository.findByOwnerId(principal.getId())
                : propertyRepository.findAll();

        List<Map<String, Object>> propRates = new ArrayList<>();
        for (Property p : properties) {
            List<Room> pRooms = roomRepository.findByPropertyId(p.getId());
            long pTotal = pRooms.size();
            long pOcc = pRooms.stream().filter(r -> r.getAvailabilityStatus() == AvailabilityStatus.OCCUPIED).count();
            double rate = pTotal > 0 ? ((double) pOcc / pTotal) * 100.0 : 0.0;
            propRates.add(Map.of(
                    "property", p.getName(),
                    "totalRooms", pTotal,
                    "occupiedRooms", pOcc,
                    "rate", Math.round(rate * 10.0) / 10.0
            ));
        }
        dto.setPropertyOccupancyRates(propRates);

        // Room Type distribution
        Map<String, Long> typeMap = rooms.stream()
                .collect(Collectors.groupingBy(r -> r.getRoomType().name(), Collectors.counting()));
        List<Map<String, Object>> typeDist = typeMap.entrySet().stream()
                .map(e -> Map.<String, Object>of("type", e.getKey(), "count", e.getValue()))
                .collect(Collectors.toList());
        dto.setRoomTypeDistribution(typeDist);

        return dto;
    }

    @Transactional(readOnly = true)
    public MaintenanceReportDto getMaintenanceReport(UserPrincipal principal, Long propertyId) {
        MaintenanceReportDto dto = new MaintenanceReportDto();

        List<com.stayease.entity.MaintenanceRequest> list = (propertyId != null)
                ? maintenanceRepository.findByPropertyIdOrderBySubmittedDateDesc(propertyId)
                : (principal.getRole() == Role.OWNER)
                    ? maintenanceRepository.findByPropertyOwnerIdOrderBySubmittedDateDesc(principal.getId())
                    : maintenanceRepository.findAll();

        dto.setTotalRequests(list.size());
        dto.setPendingRequests(list.stream().filter(m -> m.getStatus() == MaintenanceStatus.SUBMITTED).count());
        dto.setInProgressRequests(list.stream().filter(m -> m.getStatus() == MaintenanceStatus.IN_PROGRESS).count());
        dto.setCompletedRequests(list.stream().filter(m -> m.getStatus() == MaintenanceStatus.COMPLETED).count());

        Map<String, Long> catMap = list.stream()
                .collect(Collectors.groupingBy(m -> m.getCategory().name(), Collectors.counting()));
        List<Map<String, Object>> catList = catMap.entrySet().stream()
                .map(e -> Map.<String, Object>of("category", e.getKey(), "count", e.getValue()))
                .collect(Collectors.toList());
        dto.setCategoryBreakdown(catList);

        Map<String, Long> statusMap = list.stream()
                .collect(Collectors.groupingBy(m -> m.getStatus().name(), Collectors.counting()));
        List<Map<String, Object>> stList = statusMap.entrySet().stream()
                .map(e -> Map.<String, Object>of("status", e.getKey(), "count", e.getValue()))
                .collect(Collectors.toList());
        dto.setStatusBreakdown(stList);

        return dto;
    }

    public String exportPaymentsCsv(UserPrincipal principal, Long propertyId) {
        List<Payment> payments = (propertyId != null)
                ? paymentRepository.findByPropertyIdOrderByPaymentDateDesc(propertyId)
                : (principal.getRole() == Role.OWNER)
                    ? paymentRepository.findByPropertyOwnerIdOrderByPaymentDateDesc(principal.getId())
                    : paymentRepository.findAll();

        StringBuilder sb = new StringBuilder();
        sb.append("Receipt Number,Date,Property,Tenant,Amount,Method,Reference,Notes\n");
        for (Payment p : payments) {
            sb.append("\"").append(p.getReceiptNumber()).append("\",")
              .append("\"").append(p.getPaymentDate()).append("\",")
              .append("\"").append(p.getProperty().getName()).append("\",")
              .append("\"").append(p.getTenant().getFullName()).append("\",")
              .append(p.getAmount()).append(",")
              .append("\"").append(p.getPaymentMethod()).append("\",")
              .append("\"").append(p.getReferenceNumber() != null ? p.getReferenceNumber() : "").append("\",")
              .append("\"").append(p.getNotes() != null ? p.getNotes().replace("\"", "'") : "").append("\"\n");
        }
        return sb.toString();
    }
}
