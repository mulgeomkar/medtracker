package com.medtrack.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    @JsonIgnore
    private String password;
    
    private UserRole role;
    
    private boolean enabled = true;
    
    private String phoneNumber;
    
    private String dateOfBirth;
    
    private String address;
    
    private String profileImage;
    
    @JsonIgnore
    private String passwordResetToken;
    
    @JsonIgnore
    private LocalDateTime passwordResetTokenExpiry;
    
    // Patient-specific fields
    private String medicalHistory;
    private String allergies;
    private String emergencyContact;
    
    // Doctor-specific fields
    private String licenseNumber;
    private String specialization;
    
    // Timestamps
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum UserRole {
        PATIENT,
        DOCTOR,
        PHARMACIST,
        ADMIN
    }
}
