package com.hireflow.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadResume(MultipartFile file) {
        try {
            // Must specify raw to permit PDF streams properly!
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "raw",
                "folder", "hireflow/resumes"
            ));
            
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Failed to upload resume document");
        }
    }
}
