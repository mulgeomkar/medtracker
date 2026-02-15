package com.medtrack.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "prescriptions")
public class Prescription {
    
    @Id
    private String id;
    
    @DBRef
    private User patient;
    
    @DBRef
    private User doctor;
    
    private List<Medication> medications;
    
    private String diagnosis;
    
    private String notes;
    
    private PrescriptionStatus status = PrescriptionStatus.ACTIVE;

    private Integer refillLimit = 0;

    private Integer refillsRemaining = 0;

    private boolean doctorApproved = false;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private LocalDateTime validUntil;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Medication {
        private String name;
        private String dosage;
        private String frequency;
        private String duration;
        private String timeOfDay;
        private String instructions;
    }
    
    public enum PrescriptionStatus {
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}
