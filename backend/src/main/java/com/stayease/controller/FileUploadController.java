package com.stayease.controller;

import com.stayease.exception.BadRequestException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class FileUploadController {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final Map<String, String> ALLOWED_IMAGE_TYPES = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png",
            "webp", "image/webp"
    );

    private final Path uploadDirectory;

    public FileUploadController() {
        this.uploadDirectory = Paths.get("uploads").toAbsolutePath().normalize();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select an image to upload.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Image size must not exceed 5 MB.");
        }

        String originalFilename = file.getOriginalFilename();
        int extensionSeparator = originalFilename == null ? -1 : originalFilename.lastIndexOf('.');
        if (extensionSeparator < 0 || extensionSeparator == originalFilename.length() - 1) {
            throw new BadRequestException("Image must have a JPG, JPEG, PNG, or WEBP extension.");
        }

        String extension = originalFilename.substring(extensionSeparator + 1).toLowerCase(Locale.ROOT);
        String expectedContentType = ALLOWED_IMAGE_TYPES.get(extension);
        if (expectedContentType == null) {
            throw new BadRequestException("Only JPG, JPEG, PNG, and WEBP images are allowed.");
        }
        if (!expectedContentType.equalsIgnoreCase(file.getContentType())) {
            throw new BadRequestException("Image content type does not match its file extension.");
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path destination = uploadDirectory.resolve(filename).normalize();
        if (!destination.getParent().equals(uploadDirectory)) {
            throw new BadRequestException("Invalid image filename.");
        }

        try {
            Files.createDirectories(uploadDirectory);
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store uploaded image.", ex);
        }

        return ResponseEntity.ok(new FileUploadResponse("/uploads/" + filename));
    }

    public record FileUploadResponse(String url) {}
}
