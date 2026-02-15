package com.medtrack.controller;

import com.medtrack.model.AppNotification;
import com.medtrack.model.InventoryItem;
import com.medtrack.model.Prescription;
import com.medtrack.model.RefillRequest;
import com.medtrack.model.User;
import com.medtrack.repository.AppNotificationRepository;
import com.medtrack.repository.InventoryItemRepository;
import com.medtrack.repository.PrescriptionRepository;
import com.medtrack.repository.RefillRequestRepository;
import com.medtrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacist")
@CrossOrigin(origins = "*")
public class PharmacistController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private RefillRequestRepository refillRequestRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AppNotificationRepository appNotificationRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);

        List<InventoryItem> inventory = inventoryItemRepository.findByPharmacist(pharmacist);
        long lowStock = inventory.stream()
                .filter(i -> i.getStatus() == InventoryItem.InventoryStatus.LOW_STOCK)
                .count();
        long pendingOrders = refillRequestRepository.findByPharmacistOrderByCreatedAtDesc(pharmacist).stream()
                .filter(order -> isPendingRefillStatus(order.getStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalItems", inventory.size());
        stats.put("pendingOrders", pendingOrders);
        stats.put("lowStockAlerts", lowStock);
        stats.put("expiringItems", 0);
        stats.put("unreadNotifications", appNotificationRepository.countByRecipientAndReadFalse(pharmacist));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory(Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        List<InventoryItem> inventory = inventoryItemRepository.findByPharmacist(pharmacist);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/inventory/{id}")
    public ResponseEntity<?> getInventoryItem(@PathVariable String id, Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        if (!item.getPharmacist().getId().equals(pharmacist.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        return ResponseEntity.ok(item);
    }

    @PostMapping("/inventory")
    public ResponseEntity<?> addInventoryItem(@RequestBody InventoryItem item, Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        item.setPharmacist(pharmacist);
        InventoryItem savedItem = inventoryItemRepository.save(item);
        return ResponseEntity.ok(savedItem);
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<?> updateInventoryItem(@PathVariable String id, @RequestBody InventoryItem item, Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        InventoryItem existingItem = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        if (!existingItem.getPharmacist().getId().equals(pharmacist.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        existingItem.setMedicineName(item.getMedicineName());
        existingItem.setBatchNumber(item.getBatchNumber());
        existingItem.setQuantity(item.getQuantity());
        existingItem.setPrice(item.getPrice());
        existingItem.setExpiryDate(item.getExpiryDate());
        existingItem.setStatus(item.getStatus());

        InventoryItem updatedItem = inventoryItemRepository.save(existingItem);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable String id, Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        if (!item.getPharmacist().getId().equals(pharmacist.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        inventoryItemRepository.delete(item);
        return ResponseEntity.ok("Inventory item deleted successfully");
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<?> getPendingOrders(Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        List<RefillRequest> pendingRequests = refillRequestRepository.findByPharmacistOrderByCreatedAtDesc(pharmacist)
                .stream()
                .filter(request -> isPendingRefillStatus(request.getStatus()))
                .toList();
        return ResponseEntity.ok(pendingRequests);
    }

    @PutMapping("/orders/{orderId}/fulfill")
    public ResponseEntity<?> fulfillOrder(
            @PathVariable String orderId,
            @RequestBody(required = false) Map<String, String> payload,
            Authentication authentication
    ) {
        User pharmacist = getUserFromAuthentication(authentication);
        RefillRequest refillRequest = refillRequestRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Refill request not found"));

        if (refillRequest.getPharmacist() == null || !refillRequest.getPharmacist().getId().equals(pharmacist.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        RefillRequest.RefillStatus currentStatus = refillRequest.getStatus();
        RefillRequest.RefillStatus nextStatus = RefillRequest.RefillStatus.PROCESSING;
        if (payload != null && payload.get("status") != null) {
            try {
                nextStatus = RefillRequest.RefillStatus.valueOf(payload.get("status").trim().toUpperCase());
            } catch (IllegalArgumentException exception) {
                return ResponseEntity.badRequest().body("Invalid refill status");
            }
        }
        refillRequest.setStatus(nextStatus);
        RefillRequest updated = refillRequestRepository.save(refillRequest);

        if (nextStatus == RefillRequest.RefillStatus.DISPENSED && currentStatus != RefillRequest.RefillStatus.DISPENSED) {
            Prescription prescription = refillRequest.getPrescription();
            if (prescription != null && prescription.getRefillsRemaining() != null && prescription.getRefillsRemaining() > 0) {
                prescription.setRefillsRemaining(prescription.getRefillsRemaining() - 1);
                if (prescription.getRefillsRemaining() <= 0) {
                    prescription.setStatus(Prescription.PrescriptionStatus.COMPLETED);
                }
                prescriptionRepository.save(prescription);
            }
        }

        createNotification(
                refillRequest.getPatient(),
                pharmacist,
                "REFILL_STATUS_UPDATED",
                "Refill Status Updated",
                "Your refill request is now " + nextStatus.name(),
                "REFILL_REQUEST",
                updated.getId()
        );

        return ResponseEntity.ok(updated);
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getInventoryAnalytics(Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        List<InventoryItem> inventory = inventoryItemRepository.findByPharmacist(pharmacist);
        double totalValue = inventory.stream().mapToDouble(item -> item.getQuantity() * item.getPrice()).sum();
        long lowStock = inventory.stream().filter(item -> item.getStatus() == InventoryItem.InventoryStatus.LOW_STOCK).count();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalItems", inventory.size());
        analytics.put("totalValue", totalValue);
        analytics.put("lowStockItems", lowStock);
        analytics.put("expiringItems", 0);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/alerts/low-stock")
    public ResponseEntity<?> getLowStockAlerts(Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        List<InventoryItem> lowStock = inventoryItemRepository.findByPharmacist(pharmacist).stream()
                .filter(item -> item.getStatus() == InventoryItem.InventoryStatus.LOW_STOCK)
                .toList();
        return ResponseEntity.ok(lowStock);
    }

    @GetMapping("/alerts/expiring")
    public ResponseEntity<?> getExpiringItems() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(appNotificationRepository.findByRecipientOrderByCreatedAtDesc(pharmacist));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable String id, Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        AppNotification notification = appNotificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(pharmacist.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }
        notification.setRead(true);
        return ResponseEntity.ok(appNotificationRepository.save(notification));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(pharmacist);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User profileData, Authentication authentication) {
        User pharmacist = getUserFromAuthentication(authentication);

        if (profileData.getName() != null) pharmacist.setName(profileData.getName());
        if (profileData.getPhoneNumber() != null) pharmacist.setPhoneNumber(profileData.getPhoneNumber());
        if (profileData.getAddress() != null) pharmacist.setAddress(profileData.getAddress().trim());
        if (profileData.getLicenseNumber() != null) pharmacist.setLicenseNumber(profileData.getLicenseNumber());
        if (profileData.getProfileImage() != null) pharmacist.setProfileImage(profileData.getProfileImage());

        userRepository.save(pharmacist);
        return ResponseEntity.ok(pharmacist);
    }

    private void createNotification(
            User recipient,
            User sender,
            String type,
            String title,
            String message,
            String referenceType,
            String referenceId
    ) {
        AppNotification notification = new AppNotification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        notification.setRead(false);
        appNotificationRepository.save(notification);
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean isPendingRefillStatus(RefillRequest.RefillStatus status) {
        return status == RefillRequest.RefillStatus.REQUESTED
                || status == RefillRequest.RefillStatus.PROCESSING
                || status == RefillRequest.RefillStatus.READY;
    }
}
