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
@Document(collection = "reminders")
public class Reminder {
    
    @Id
    private String id;
    
    @DBRef
    private User patient;
    
    private String medicineName;
    
    private String dosage;
    
    private String frequency;
    
    private List<String> times;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private String instructions;
    
    private boolean active = true;
    
    @CreatedDate
    private LocalDateTime createdAt;
}
