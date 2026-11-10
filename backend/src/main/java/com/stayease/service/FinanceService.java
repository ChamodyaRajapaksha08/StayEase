package com.stayease.service;

import com.stayease.dto.finance.*;
import com.stayease.entity.*;
import com.stayease.entity.enums.NotificationType;
import com.stayease.entity.enums.PaymentMethod;
import com.stayease.entity.enums.RentStatus;
import com.stayease.entity.enums.Role;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.*;
import com.stayease.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FinanceService {

    private final RentRecordRepository rentRecordRepository;
    private final PaymentRepository paymentRepository;
    private final UtilityBillRepository utilityBillRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final PropertyManagerRepository propertyManagerRepository;
    private final NotificationService notificationService;

    public FinanceService(RentRecordRepository rentRecordRepository,
                          PaymentRepository paymentRepository,
                          UtilityBillRepository utilityBillRepository,
                          UserRepository userRepository,
                          PropertyRepository propertyRepository,
                          RoomRepository roomRepository,
                          PropertyManagerRepository propertyManagerRepository,
                          NotificationService notificationService) {
        this.rentRecordRepository = rentRecordRepository;
        this.paymentRepository = paymentRepository;
        this.utilityBillRepository = utilityBillRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.propertyManagerRepository = propertyManagerRepository;
        this.notificationService = notificationService;
    }

    // --- RENT RECORDS ---
    @Transactional
    public RentRecordDto createRentRecord(RentRecordRequest req, UserPrincipal principal) {
        User tenant = userRepository.findById(req.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + req.getTenantId()));

        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + req.getPropertyId()));

        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + req.getRoomId()));

        RentRecord record = new RentRecord();
        record.setTenant(tenant);
        record.setProperty(property);
        record.setRoom(room);
        record.setBillingMonth(req.getBillingMonth());
        record.setDueDate(req.getDueDate());
        record.setAmount(req.getAmount());
        record.setPaidAmount(BigDecimal.ZERO);
        record.setStatus(RentStatus.UNPAID);
        record.setNotes(req.getNotes());

        RentRecord saved = rentRecordRepository.save(record);

        notificationService.sendNotification(
                tenant.getId(),
                "New Rent Invoice Generated",
                "Rent invoice for " + req.getBillingMonth() + " of $" + req.getAmount() + " has been issued for " + property.getName() + ".",
                NotificationType.RENT,
                saved.getId()
        );

        return RentRecordDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<RentRecordDto> getRentRecords(UserPrincipal principal, Long propertyId, RentStatus status) {
        List<RentRecord> list;

        if (principal.getRole() == Role.SUPER_ADMIN) {
            list = rentRecordRepository.findAll();
        } else if (principal.getRole() == Role.OWNER) {
            list = rentRecordRepository.findByPropertyOwnerIdOrderByDueDateDesc(principal.getId());
        } else if (principal.getRole() == Role.MANAGER) {
            List<PropertyManager> pms = propertyManagerRepository.findByManagerId(principal.getId());
            List<Long> propIds = pms.stream().map(pm -> pm.getProperty().getId()).collect(Collectors.toList());
            list = rentRecordRepository.findAll().stream()
                    .filter(r -> propIds.contains(r.getProperty().getId()))
                    .collect(Collectors.toList());
        } else {
            // TENANT
            list = rentRecordRepository.findByTenantIdOrderByDueDateDesc(principal.getId());
        }

        if (propertyId != null) {
            list = list.stream().filter(r -> r.getProperty().getId().equals(propertyId)).collect(Collectors.toList());
        }

        if (status != null) {
            list = list.stream().filter(r -> r.getStatus() == status).collect(Collectors.toList());
        }

        return list.stream().map(RentRecordDto::fromEntity).collect(Collectors.toList());
    }

    // --- MANUAL PAYMENTS ---
    @Transactional
    public PaymentDto recordPayment(PaymentRequest req, UserPrincipal principal) {
        User tenant = userRepository.findById(req.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + req.getTenantId()));

        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + req.getPropertyId()));

        User recordedBy = userRepository.findById(principal.getId()).orElse(null);

        Payment payment = new Payment();
        payment.setTenant(tenant);
        payment.setProperty(property);
        payment.setAmount(req.getAmount());
        payment.setPaymentDate(req.getPaymentDate() != null ? req.getPaymentDate() : LocalDate.now());
        payment.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.CASH);
        payment.setReferenceNumber(req.getReferenceNumber());
        payment.setNotes(req.getNotes());
        payment.setRecordedBy(recordedBy);

        // Generate clean unique receipt number
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String randSuffix = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        payment.setReceiptNumber("REC-" + datePrefix + "-" + randSuffix);

        // Update RentRecord if provided
        if (req.getRentRecordId() != null) {
            RentRecord rentRecord = rentRecordRepository.findById(req.getRentRecordId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rent record not found with id: " + req.getRentRecordId()));
            BigDecimal newPaid = rentRecord.getPaidAmount().add(req.getAmount());
            rentRecord.setPaidAmount(newPaid);
            rentRecordRepository.save(rentRecord);
            payment.setRentRecord(rentRecord);
        }

        // Update UtilityBill if provided
        if (req.getUtilityBillId() != null) {
            UtilityBill utilityBill = utilityBillRepository.findById(req.getUtilityBillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utility bill not found with id: " + req.getUtilityBillId()));
            utilityBill.setStatus(RentStatus.PAID);
            utilityBillRepository.save(utilityBill);
            payment.setUtilityBill(utilityBill);
        }

        Payment saved = paymentRepository.save(payment);

        notificationService.sendNotification(
                tenant.getId(),
                "Payment Recorded",
                "A payment of $" + req.getAmount() + " has been recorded. Receipt: " + saved.getReceiptNumber(),
                NotificationType.PAYMENT,
                saved.getId()
        );

        return PaymentDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPayments(UserPrincipal principal, Long propertyId) {
        List<Payment> list;

        if (principal.getRole() == Role.SUPER_ADMIN) {
            list = paymentRepository.findAll();
        } else if (principal.getRole() == Role.OWNER) {
            list = paymentRepository.findByPropertyOwnerIdOrderByPaymentDateDesc(principal.getId());
        } else if (principal.getRole() == Role.MANAGER) {
            List<PropertyManager> pms = propertyManagerRepository.findByManagerId(principal.getId());
            List<Long> propIds = pms.stream().map(pm -> pm.getProperty().getId()).collect(Collectors.toList());
            list = paymentRepository.findAll().stream()
                    .filter(p -> propIds.contains(p.getProperty().getId()))
                    .collect(Collectors.toList());
        } else {
            list = paymentRepository.findByTenantIdOrderByPaymentDateDesc(principal.getId());
        }

        if (propertyId != null) {
            list = list.stream().filter(p -> p.getProperty().getId().equals(propertyId)).collect(Collectors.toList());
        }

        return list.stream().map(PaymentDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentDto getPaymentByReceipt(String receiptNumber) {
        Payment payment = paymentRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with number: " + receiptNumber));
        return PaymentDto.fromEntity(payment);
    }

    // --- UTILITY BILLS ---
    @Transactional
    public UtilityBillDto createUtilityBill(UtilityBillRequest req, UserPrincipal principal) {
        User tenant = userRepository.findById(req.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with id: " + req.getTenantId()));

        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + req.getPropertyId()));

        UtilityBill bill = new UtilityBill();
        bill.setTenant(tenant);
        bill.setProperty(property);
        bill.setBillType(req.getBillType());
        bill.setBillingMonth(req.getBillingMonth());
        bill.setPreviousReading(req.getPreviousReading());
        bill.setCurrentReading(req.getCurrentReading());
        bill.setUnitRate(req.getUnitRate());

        BigDecimal calculatedAmount = req.getAmount();
        if (req.getPreviousReading() != null && req.getCurrentReading() != null && req.getUnitRate() != null) {
            BigDecimal units = req.getCurrentReading().subtract(req.getPreviousReading());
            if (units.compareTo(BigDecimal.ZERO) > 0) {
                calculatedAmount = units.multiply(req.getUnitRate());
            }
        }
        bill.setAmount(calculatedAmount);
        bill.setDueDate(req.getDueDate());
        bill.setStatus(RentStatus.UNPAID);

        UtilityBill saved = utilityBillRepository.save(bill);

        notificationService.sendNotification(
                tenant.getId(),
                "New " + req.getBillType() + " Bill",
                "A new " + req.getBillType() + " bill for " + req.getBillingMonth() + " of $" + calculatedAmount + " has been added.",
                NotificationType.UTILITY,
                saved.getId()
        );

        return UtilityBillDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<UtilityBillDto> getUtilityBills(UserPrincipal principal, Long propertyId, RentStatus status) {
        List<UtilityBill> list;

        if (principal.getRole() == Role.SUPER_ADMIN) {
            list = utilityBillRepository.findAll();
        } else if (principal.getRole() == Role.OWNER) {
            list = utilityBillRepository.findByPropertyOwnerIdOrderByDueDateDesc(principal.getId());
        } else if (principal.getRole() == Role.MANAGER) {
            List<PropertyManager> pms = propertyManagerRepository.findByManagerId(principal.getId());
            List<Long> propIds = pms.stream().map(pm -> pm.getProperty().getId()).collect(Collectors.toList());
            list = utilityBillRepository.findAll().stream()
                    .filter(u -> propIds.contains(u.getProperty().getId()))
                    .collect(Collectors.toList());
        } else {
            list = utilityBillRepository.findByTenantIdOrderByDueDateDesc(principal.getId());
        }

        if (propertyId != null) {
            list = list.stream().filter(u -> u.getProperty().getId().equals(propertyId)).collect(Collectors.toList());
        }

        if (status != null) {
            list = list.stream().filter(u -> u.getStatus() == status).collect(Collectors.toList());
        }

        return list.stream().map(UtilityBillDto::fromEntity).collect(Collectors.toList());
    }
}
