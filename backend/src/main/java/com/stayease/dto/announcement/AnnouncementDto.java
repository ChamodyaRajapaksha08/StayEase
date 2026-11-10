package com.stayease.dto.announcement;

import com.stayease.dto.auth.UserDto;
import com.stayease.dto.property.PropertyDto;
import com.stayease.entity.Announcement;

import java.time.LocalDateTime;

public class AnnouncementDto {
    private Long id;
    private PropertyDto property;
    private UserDto author;
    private String title;
    private String content;
    private String targetRole;
    private LocalDateTime createdAt;

    public AnnouncementDto() {}

    public static AnnouncementDto fromEntity(Announcement ann) {
        if (ann == null) return null;
        AnnouncementDto dto = new AnnouncementDto();
        dto.setId(ann.getId());
        dto.setProperty(PropertyDto.fromEntity(ann.getProperty()));
        dto.setAuthor(UserDto.fromEntity(ann.getAuthor()));
        dto.setTitle(ann.getTitle());
        dto.setContent(ann.getContent());
        dto.setTargetRole(ann.getTargetRole());
        dto.setCreatedAt(ann.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PropertyDto getProperty() { return property; }
    public void setProperty(PropertyDto property) { this.property = property; }

    public UserDto getAuthor() { return author; }
    public void setAuthor(UserDto author) { this.author = author; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
