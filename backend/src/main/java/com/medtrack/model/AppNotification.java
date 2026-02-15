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
@Document(collection = "notifications")
public class AppNotification {

    @Id
    private String id;

    @DBRef
    private User recipient;

    @DBRef
    private User sender;

    private String type;

    private String title;

    private String message;

    private String referenceType;

    private String referenceId;

    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
