package com.medtrack.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "refill_requests")
public class RefillRequest {

    @Id
    private String id;

    @DBRef
    private User patient;

    @DBRef
    private User pharmacist;

    @DBRef
    private Prescription prescription;

    private RefillStatus status = RefillStatus.REQUESTED;

    private String note;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum RefillStatus {
        REQUESTED,
        PROCESSING,
        READY,
        DISPENSED,
        REJECTED
    }
}
