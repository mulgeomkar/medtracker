package com.medtrack.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "dose_logs")
public class DoseLog {

    @Id
    private String id;

    @DBRef
    private User patient;

    @DBRef
    private Reminder reminder;

    private LocalDateTime scheduledAt;

    private LocalDateTime takenAt;

    private DoseStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum DoseStatus {
        TAKEN,
        MISSED
    }
}
