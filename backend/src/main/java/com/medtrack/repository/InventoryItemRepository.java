package com.medtrack.repository;

import com.medtrack.model.InventoryItem;
import com.medtrack.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryItemRepository extends MongoRepository<InventoryItem, String> {
    List<InventoryItem> findByPharmacist(User pharmacist);
    List<InventoryItem> findByStatus(InventoryItem.InventoryStatus status);
}
