package com.medtrack.dto;

import com.medtrack.model.User;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phoneNumber;
    private String dateOfBirth;
    private String address;
    private User.UserRole role;
    
    // Patient-specific fields
    private String medicalHistory;
    private String allergies;
    private String emergencyContact;
    
    // Doctor-specific fields
    private String licenseNumber;
    private String specialization;
}
