-- StayEase: Smart Hostel & Apartment Management System
-- MySQL 8 Database Schema

CREATE DATABASE IF NOT EXISTS stayease_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stayease_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('SUPER_ADMIN', 'OWNER', 'MANAGER', 'TENANT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB;

-- 2. Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('HOSTEL', 'BOARDING_HOUSE', 'APARTMENT') NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    image_url VARCHAR(500),
    owner_id BIGINT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property_owner (owner_id),
    INDEX idx_property_city (city),
    INDEX idx_property_type (type)
) ENGINE=InnoDB;

-- 3. Property Managers (Assignment Table)
CREATE TABLE IF NOT EXISTS property_managers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    manager_id BIGINT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_property_manager (property_id, manager_id),
    INDEX idx_pm_manager (manager_id)
) ENGINE=InnoDB;

-- 4. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    room_number VARCHAR(30) NOT NULL,
    room_type ENUM('SINGLE', 'DOUBLE', 'SHARED', 'DELUXE', 'STUDIO') NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    available_beds INT NOT NULL DEFAULT 1,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    facilities TEXT,
    image_url VARCHAR(500),
    availability_status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY uq_property_room (property_id, room_number),
    INDEX idx_room_property (property_id),
    INDEX idx_room_status (availability_status)
) ENGINE=InnoDB;

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_booking_tenant (tenant_id),
    INDEX idx_booking_property (property_id),
    INDEX idx_booking_room (room_id),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB;

-- 6. Tenant Profiles Table
CREATE TABLE IF NOT EXISTS tenant_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    emergency_contact VARCHAR(100),
    id_card_number VARCHAR(50),
    address VARCHAR(255),
    current_property_id BIGINT,
    current_room_id BIGINT,
    check_in_date DATE,
    check_out_date DATE,
    occupancy_status ENUM('ACTIVE', 'INACTIVE', 'FORMER') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_property_id) REFERENCES properties(id) ON DELETE SET NULL,
    FOREIGN KEY (current_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    INDEX idx_tp_property (current_property_id),
    INDEX idx_tp_room (current_room_id)
) ENGINE=InnoDB;

-- 7. Rent Records Table
CREATE TABLE IF NOT EXISTS rent_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    billing_month VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    due_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('PAID', 'UNPAID', 'PARTIALLY_PAID', 'OVERDUE') NOT NULL DEFAULT 'UNPAID',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_rent_tenant (tenant_id),
    INDEX idx_rent_property (property_id),
    INDEX idx_rent_month (billing_month),
    INDEX idx_rent_status (status)
) ENGINE=InnoDB;

-- 8. Utility Bills Table
CREATE TABLE IF NOT EXISTS utility_bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    bill_type ENUM('ELECTRICITY', 'WATER', 'INTERNET', 'GAS', 'OTHER') NOT NULL,
    billing_month VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    previous_reading DECIMAL(10, 2),
    current_reading DECIMAL(10, 2),
    unit_rate DECIMAL(10, 2),
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('UNPAID', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_ub_tenant (tenant_id),
    INDEX idx_ub_property (property_id),
    INDEX idx_ub_status (status)
) ENGINE=InnoDB;

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rent_record_id BIGINT,
    utility_bill_id BIGINT,
    tenant_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE_MANUAL') NOT NULL,
    reference_number VARCHAR(100),
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    notes TEXT,
    recorded_by_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rent_record_id) REFERENCES rent_records(id) ON DELETE SET NULL,
    FOREIGN KEY (utility_bill_id) REFERENCES utility_bills(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_pay_tenant (tenant_id),
    INDEX idx_pay_property (property_id),
    INDEX idx_pay_receipt (receipt_number)
) ENGINE=InnoDB;

-- 10. Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    room_id BIGINT,
    category ENUM('ELECTRICAL', 'PLUMBING', 'FURNITURE', 'CLEANING', 'INTERNET', 'OTHER') NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    status ENUM('SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    resolution_notes TEXT,
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    INDEX idx_maint_tenant (tenant_id),
    INDEX idx_maint_property (property_id),
    INDEX idx_maint_status (status)
) ENGINE=InnoDB;

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('BOOKING', 'RENT', 'UTILITY', 'PAYMENT', 'MAINTENANCE', 'ANNOUNCEMENT', 'SYSTEM') NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB;

-- 12. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT,
    author_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    target_role VARCHAR(50) DEFAULT 'ALL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ann_property (property_id)
) ENGINE=InnoDB;
