package com.stayease.dto.notification;

import com.stayease.entity.Notification;
import com.stayease.entity.enums.NotificationType;

import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private Long referenceId;
    private LocalDateTime createdAt;

    public NotificationDto() {}

    public static NotificationDto fromEntity(Notification notif) {
        if (notif == null) return null;
        NotificationDto dto = new NotificationDto();
        dto.setId(notif.getId());
        if (notif.getUser() != null) {
            dto.setUserId(notif.getUser().getId());
        }
        dto.setTitle(notif.getTitle());
        dto.setMessage(notif.getMessage());
        dto.setType(notif.getType());
        dto.setRead(notif.isRead());
        dto.setReferenceId(notif.getReferenceId());
        dto.setCreatedAt(notif.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
