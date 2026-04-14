package com.hireflow.controller;

import com.hireflow.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/upload")
@RequiredArgsConstructor
public class PublicUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/resume")
    public ResponseEntity<Map<String, String>> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is missing");
        }

        // Basic validation for PDF
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }

        // Basic validation for size (5MB = 5 * 1024 * 1024 bytes)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size must be less than 5MB");
        }

        String secureUrl = cloudinaryService.uploadResume(file);
        return ResponseEntity.ok(Map.of("url", secureUrl));
    }
}
