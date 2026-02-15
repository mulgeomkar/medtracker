package com.medtrack.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "inventory")
public class InventoryItem {
    
    @Id
    private String id;
    
    @DBRef
    private User pharmacist;
    
    private String medicineName;
    
    private String batchNumber;
    
    private Integer quantity;
    
    private Double price;
    
    private LocalDateTime expiryDate;
    
    private InventoryStatus status = InventoryStatus.IN_STOCK;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum InventoryStatus {
        IN_STOCK,
        LOW_STOCK,
        OUT_OF_STOCK,
        EXPIRED
    }
}
