package com.medtrack.controller;

import com.medtrack.model.AppNotification;
import com.medtrack.model.DoseLog;
import com.medtrack.model.InventoryItem;
import com.medtrack.model.Prescription;
import com.medtrack.model.RefillRequest;
import com.medtrack.model.Reminder;
import com.medtrack.model.User;
import com.medtrack.repository.AppNotificationRepository;
import com.medtrack.repository.DoseLogRepository;
import com.medtrack.repository.InventoryItemRepository;
import com.medtrack.repository.PrescriptionRepository;
import com.medtrack.repository.RefillRequestRepository;
import com.medtrack.repository.ReminderRepository;
import com.medtrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private RefillRequestRepository refillRequestRepository;

    @Autowired
    private AppNotificationRepository appNotificationRepository;

    @Autowired
    private DoseLogRepository doseLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        List<User> users = userRepository.findAll();
        List<Prescription> prescriptions = prescriptionRepository.findAll();
        List<Reminder> reminders = reminderRepository.findAll();
        List<InventoryItem> inventoryItems = inventoryItemRepository.findAll();
        List<RefillRequest> refillRequests = refillRequestRepository.findAll();
        List<AppNotification> notifications = appNotificationRepository.findAll();
        List<DoseLog> doseLogs = doseLogRepository.findAll();
        List<RefillRequest> pendingRefillRequests = refillRequests.stream()
                .filter(request -> request.getStatus() == RefillRequest.RefillStatus.REQUESTED
                        || request.getStatus() == RefillRequest.RefillStatus.PROCESSING
                        || request.getStatus() == RefillRequest.RefillStatus.READY)
                .toList();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", users.size());
        stats.put("patients", users.stream().filter(user -> user.getRole() == User.UserRole.PATIENT).count());
        stats.put("doctors", users.stream().filter(user -> user.getRole() == User.UserRole.DOCTOR).count());
        stats.put("pharmacists", users.stream().filter(user -> user.getRole() == User.UserRole.PHARMACIST).count());
        stats.put("admins", users.stream().filter(user -> user.getRole() == User.UserRole.ADMIN).count());
        stats.put("totalPrescriptions", prescriptions.size());
        stats.put("activePrescriptions", prescriptions.stream()
                .filter(prescription -> prescription.getStatus() == Prescription.PrescriptionStatus.ACTIVE)
                .count());
        stats.put("totalReminders", reminders.size());
        stats.put("activeReminders", reminders.stream().filter(Reminder::isActive).count());
        stats.put("totalInventoryItems", inventoryItems.size());
        stats.put("totalRefillRequests", refillRequests.size());
        stats.put("pendingRefillRequests", refillRequests.stream()
                .filter(request -> request.getStatus() == RefillRequest.RefillStatus.REQUESTED
                        || request.getStatus() == RefillRequest.RefillStatus.PROCESSING
                        || request.getStatus() == RefillRequest.RefillStatus.READY)
                .count());
        stats.put("totalNotifications", notifications.size());
        stats.put("unreadNotifications", notifications.stream().filter(notification -> !notification.isRead()).count());
        stats.put("totalDoseLogs", doseLogs.size());
        stats.put("recentUsers", sortByDate(users, User::getCreatedAt).stream().limit(6).toList());
        stats.put("recentRefillRequests", sortByDate(refillRequests, RefillRequest::getCreatedAt).stream().limit(6).toList());
        stats.put("recentPendingRefillRequests", sortByDate(pendingRefillRequests, RefillRequest::getCreatedAt).stream().limit(6).toList());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam(required = false) String role) {
        if (role == null || role.isBlank()) {
            return ResponseEntity.ok(sortByDate(userRepository.findAll(), User::getCreatedAt));
        }
        User.UserRole parsedRole;
        try {
            parsedRole = parseRole(role);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
        return ResponseEntity.ok(sortByDate(userRepository.findByRole(parsedRole), User::getCreatedAt));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> payload) {
        String email = stringValue(payload.get("email")).toLowerCase();
        if (email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        String roleValue = stringValue(payload.get("role"));
        if (roleValue.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
        }

        User user = new User();
        user.setName(stringValue(payload.get("name")));
        if (user.getName().isBlank()) {
            user.setName(email.split("@")[0]);
        }
        user.setEmail(email);
        try {
            user.setRole(parseRole(roleValue));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }

        String password = stringValue(payload.get("password"));
        if (password.isBlank()) {
            password = UUID.randomUUID().toString();
        }
        user.setPassword(passwordEncoder.encode(password));
        user.setEnabled(parseBoolean(payload.get("enabled"), true));
        user.setPhoneNumber(nullIfBlank(payload.get("phoneNumber")));
        user.setDateOfBirth(nullIfBlank(payload.get("dateOfBirth")));
        user.setAddress(nullIfBlank(payload.get("address")));
        user.setLicenseNumber(nullIfBlank(payload.get("licenseNumber")));
        user.setSpecialization(nullIfBlank(payload.get("specialization")));
        user.setMedicalHistory(nullIfBlank(payload.get("medicalHistory")));
        user.setAllergies(nullIfBlank(payload.get("allergies")));
        user.setEmergencyContact(nullIfBlank(payload.get("emergencyContact")));
        user.setProfileImage(nullIfBlank(payload.get("profileImage")));

        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        String nextEmail = stringValue(payload.get("email")).toLowerCase();
        if (!nextEmail.isBlank() && !nextEmail.equals(user.getEmail())) {
            if (userRepository.existsByEmail(nextEmail)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            }
            user.setEmail(nextEmail);
        }

        String name = stringValue(payload.get("name"));
        if (!name.isBlank()) user.setName(name);

        String roleValue = stringValue(payload.get("role"));
        if (!roleValue.isBlank()) {
            try {
                user.setRole(parseRole(roleValue));
            } catch (IllegalArgumentException exception) {
                return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
            }
        }

        if (payload.containsKey("enabled")) user.setEnabled(parseBoolean(payload.get("enabled"), user.isEnabled()));

        String password = stringValue(payload.get("password"));
        if (!password.isBlank()) user.setPassword(passwordEncoder.encode(password));

        if (payload.containsKey("phoneNumber")) user.setPhoneNumber(nullIfBlank(payload.get("phoneNumber")));
        if (payload.containsKey("dateOfBirth")) user.setDateOfBirth(nullIfBlank(payload.get("dateOfBirth")));
        if (payload.containsKey("address")) user.setAddress(nullIfBlank(payload.get("address")));
        if (payload.containsKey("licenseNumber")) user.setLicenseNumber(nullIfBlank(payload.get("licenseNumber")));
        if (payload.containsKey("specialization")) user.setSpecialization(nullIfBlank(payload.get("specialization")));
        if (payload.containsKey("medicalHistory")) user.setMedicalHistory(nullIfBlank(payload.get("medicalHistory")));
        if (payload.containsKey("allergies")) user.setAllergies(nullIfBlank(payload.get("allergies")));
        if (payload.containsKey("emergencyContact")) user.setEmergencyContact(nullIfBlank(payload.get("emergencyContact")));
        if (payload.containsKey("profileImage")) user.setProfileImage(nullIfBlank(payload.get("profileImage")));

        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id, Authentication authentication) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        if (authentication != null) {
            Optional<User> currentAdmin = userRepository.findByEmail(authentication.getName());
            if (currentAdmin.isPresent() && id.equals(currentAdmin.get().getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "You cannot delete your own account"));
            }
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptions() {
        return ResponseEntity.ok(sortByDate(prescriptionRepository.findAll(), Prescription::getCreatedAt));
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<?> createPrescription(@RequestBody Prescription payload) {
        if (payload.getPatient() == null || isBlank(payload.getPatient().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Patient is required"));
        }
        if (payload.getDoctor() == null || isBlank(payload.getDoctor().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor is required"));
        }

        User patient = getUserById(payload.getPatient().getId(), "Patient");
        User doctor = getUserById(payload.getDoctor().getId(), "Doctor");

        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setMedications(payload.getMedications() == null ? new ArrayList<>() : payload.getMedications());
        prescription.setDiagnosis(payload.getDiagnosis());
        prescription.setNotes(payload.getNotes());
        prescription.setStatus(payload.getStatus() == null ? Prescription.PrescriptionStatus.ACTIVE : payload.getStatus());
        prescription.setDoctorApproved(true);
        Integer refillLimit = payload.getRefillLimit() == null ? 0 : payload.getRefillLimit();
        prescription.setRefillLimit(refillLimit);
        prescription.setRefillsRemaining(payload.getRefillsRemaining() == null ? refillLimit : payload.getRefillsRemaining());
        prescription.setValidUntil(payload.getValidUntil());

        return ResponseEntity.ok(prescriptionRepository.save(prescription));
    }

    @PutMapping("/prescriptions/{id}")
    public ResponseEntity<?> updatePrescription(@PathVariable String id, @RequestBody Prescription payload) {
        Prescription existing = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (payload.getPatient() != null && !isBlank(payload.getPatient().getId())) {
            existing.setPatient(getUserById(payload.getPatient().getId(), "Patient"));
        }
        if (payload.getDoctor() != null && !isBlank(payload.getDoctor().getId())) {
            existing.setDoctor(getUserById(payload.getDoctor().getId(), "Doctor"));
        }
        if (payload.getMedications() != null) existing.setMedications(payload.getMedications());
        if (payload.getDiagnosis() != null) existing.setDiagnosis(payload.getDiagnosis());
        if (payload.getNotes() != null) existing.setNotes(payload.getNotes());
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());
        if (payload.getRefillLimit() != null) existing.setRefillLimit(payload.getRefillLimit());
        if (payload.getRefillsRemaining() != null) existing.setRefillsRemaining(payload.getRefillsRemaining());
        if (payload.getValidUntil() != null) existing.setValidUntil(payload.getValidUntil());

        return ResponseEntity.ok(prescriptionRepository.save(existing));
    }

    @DeleteMapping("/prescriptions/{id}")
    public ResponseEntity<?> deletePrescription(@PathVariable String id) {
        if (!prescriptionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        prescriptionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Prescription deleted successfully"));
    }

    @GetMapping("/reminders")
    public ResponseEntity<?> getReminders() {
        return ResponseEntity.ok(sortByDate(reminderRepository.findAll(), Reminder::getCreatedAt));
    }

    @PostMapping("/reminders")
    public ResponseEntity<?> createReminder(@RequestBody Reminder payload) {
        if (payload.getPatient() == null || isBlank(payload.getPatient().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Patient is required"));
        }

        Reminder reminder = new Reminder();
        reminder.setPatient(getUserById(payload.getPatient().getId(), "Patient"));
        reminder.setMedicineName(payload.getMedicineName());
        reminder.setDosage(payload.getDosage());
        reminder.setFrequency(payload.getFrequency());
        reminder.setTimes(payload.getTimes());
        reminder.setStartDate(payload.getStartDate() == null ? LocalDateTime.now() : payload.getStartDate());
        reminder.setEndDate(payload.getEndDate());
        reminder.setInstructions(payload.getInstructions());
        reminder.setActive(true);

        return ResponseEntity.ok(reminderRepository.save(reminder));
    }

    @PutMapping("/reminders/{id}")
    public ResponseEntity<?> updateReminder(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        Reminder existing = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        String patientId = extractNestedId(payload.get("patient"));
        if (patientId.isBlank()) {
            patientId = stringValue(payload.get("patientId"));
        }
        if (!patientId.isBlank()) existing.setPatient(getUserById(patientId, "Patient"));

        if (payload.containsKey("medicineName")) existing.setMedicineName(nullIfBlank(payload.get("medicineName")));
        if (payload.containsKey("dosage")) existing.setDosage(nullIfBlank(payload.get("dosage")));
        if (payload.containsKey("frequency")) existing.setFrequency(nullIfBlank(payload.get("frequency")));
        if (payload.containsKey("times")) existing.setTimes(parseTimes(payload.get("times")));
        if (payload.containsKey("startDate")) existing.setStartDate(parseDateTimeValue(payload.get("startDate")));
        if (payload.containsKey("endDate")) existing.setEndDate(parseDateTimeValue(payload.get("endDate")));
        if (payload.containsKey("instructions")) existing.setInstructions(nullIfBlank(payload.get("instructions")));
        if (payload.containsKey("active")) existing.setActive(parseBoolean(payload.get("active"), existing.isActive()));

        return ResponseEntity.ok(reminderRepository.save(existing));
    }

    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable String id) {
        if (!reminderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reminderRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Reminder deleted successfully"));
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory() {
        return ResponseEntity.ok(sortByDate(inventoryItemRepository.findAll(), InventoryItem::getCreatedAt));
    }

    @PostMapping("/inventory")
    public ResponseEntity<?> createInventoryItem(@RequestBody InventoryItem payload) {
        if (payload.getPharmacist() == null || isBlank(payload.getPharmacist().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Pharmacist is required"));
        }

        InventoryItem item = new InventoryItem();
        item.setPharmacist(getUserById(payload.getPharmacist().getId(), "Pharmacist"));
        item.setMedicineName(payload.getMedicineName());
        item.setBatchNumber(payload.getBatchNumber());
        item.setQuantity(payload.getQuantity());
        item.setPrice(payload.getPrice());
        item.setExpiryDate(payload.getExpiryDate());
        item.setStatus(resolveInventoryStatus(payload.getStatus(), payload.getQuantity()));

        return ResponseEntity.ok(inventoryItemRepository.save(item));
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<?> updateInventoryItem(@PathVariable String id, @RequestBody InventoryItem payload) {
        InventoryItem existing = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        if (payload.getPharmacist() != null && !isBlank(payload.getPharmacist().getId())) {
            existing.setPharmacist(getUserById(payload.getPharmacist().getId(), "Pharmacist"));
        }
        if (payload.getMedicineName() != null) existing.setMedicineName(payload.getMedicineName());
        if (payload.getBatchNumber() != null) existing.setBatchNumber(payload.getBatchNumber());
        if (payload.getQuantity() != null) existing.setQuantity(payload.getQuantity());
        if (payload.getPrice() != null) existing.setPrice(payload.getPrice());
        if (payload.getExpiryDate() != null) existing.setExpiryDate(payload.getExpiryDate());
        existing.setStatus(resolveInventoryStatus(payload.getStatus(), existing.getQuantity()));

        return ResponseEntity.ok(inventoryItemRepository.save(existing));
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable String id) {
        if (!inventoryItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        inventoryItemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Inventory item deleted successfully"));
    }

    @GetMapping("/refill-requests")
    public ResponseEntity<?> getRefillRequests() {
        return ResponseEntity.ok(sortByDate(refillRequestRepository.findAll(), RefillRequest::getCreatedAt));
    }

    @PostMapping("/refill-requests")
    public ResponseEntity<?> createRefillRequest(@RequestBody RefillRequest payload) {
        if (payload.getPatient() == null || isBlank(payload.getPatient().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Patient is required"));
        }
        if (payload.getPharmacist() == null || isBlank(payload.getPharmacist().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Pharmacist is required"));
        }
        if (payload.getPrescription() == null || isBlank(payload.getPrescription().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Prescription is required"));
        }

        RefillRequest refillRequest = new RefillRequest();
        refillRequest.setPatient(getUserById(payload.getPatient().getId(), "Patient"));
        refillRequest.setPharmacist(getUserById(payload.getPharmacist().getId(), "Pharmacist"));
        refillRequest.setPrescription(getPrescriptionById(payload.getPrescription().getId()));
        refillRequest.setStatus(payload.getStatus() == null ? RefillRequest.RefillStatus.REQUESTED : payload.getStatus());
        refillRequest.setNote(payload.getNote());

        return ResponseEntity.ok(refillRequestRepository.save(refillRequest));
    }

    @PutMapping("/refill-requests/{id}")
    public ResponseEntity<?> updateRefillRequest(@PathVariable String id, @RequestBody RefillRequest payload) {
        RefillRequest existing = refillRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refill request not found"));

        if (payload.getPatient() != null && !isBlank(payload.getPatient().getId())) {
            existing.setPatient(getUserById(payload.getPatient().getId(), "Patient"));
        }
        if (payload.getPharmacist() != null && !isBlank(payload.getPharmacist().getId())) {
            existing.setPharmacist(getUserById(payload.getPharmacist().getId(), "Pharmacist"));
        }
        if (payload.getPrescription() != null && !isBlank(payload.getPrescription().getId())) {
            existing.setPrescription(getPrescriptionById(payload.getPrescription().getId()));
        }
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());
        if (payload.getNote() != null) existing.setNote(payload.getNote());

        return ResponseEntity.ok(refillRequestRepository.save(existing));
    }

    @DeleteMapping("/refill-requests/{id}")
    public ResponseEntity<?> deleteRefillRequest(@PathVariable String id) {
        if (!refillRequestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        refillRequestRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Refill request deleted successfully"));
    }

    @GetMapping("/dose-logs")
    public ResponseEntity<?> getDoseLogs() {
        return ResponseEntity.ok(sortByDate(doseLogRepository.findAll(), DoseLog::getCreatedAt));
    }

    @PostMapping("/dose-logs")
    public ResponseEntity<?> createDoseLog(@RequestBody DoseLog payload) {
        if (payload.getPatient() == null || isBlank(payload.getPatient().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Patient is required"));
        }
        if (payload.getReminder() == null || isBlank(payload.getReminder().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reminder is required"));
        }
        if (payload.getStatus() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Dose status is required"));
        }

        DoseLog doseLog = new DoseLog();
        doseLog.setPatient(getUserById(payload.getPatient().getId(), "Patient"));
        doseLog.setReminder(getReminderById(payload.getReminder().getId()));
        doseLog.setScheduledAt(payload.getScheduledAt());
        doseLog.setTakenAt(payload.getTakenAt());
        doseLog.setStatus(payload.getStatus());

        return ResponseEntity.ok(doseLogRepository.save(doseLog));
    }

    @PutMapping("/dose-logs/{id}")
    public ResponseEntity<?> updateDoseLog(@PathVariable String id, @RequestBody DoseLog payload) {
        DoseLog existing = doseLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dose log not found"));

        if (payload.getPatient() != null && !isBlank(payload.getPatient().getId())) {
            existing.setPatient(getUserById(payload.getPatient().getId(), "Patient"));
        }
        if (payload.getReminder() != null && !isBlank(payload.getReminder().getId())) {
            existing.setReminder(getReminderById(payload.getReminder().getId()));
        }
        if (payload.getScheduledAt() != null) existing.setScheduledAt(payload.getScheduledAt());
        if (payload.getTakenAt() != null) existing.setTakenAt(payload.getTakenAt());
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());

        return ResponseEntity.ok(doseLogRepository.save(existing));
    }

    @DeleteMapping("/dose-logs/{id}")
    public ResponseEntity<?> deleteDoseLog(@PathVariable String id) {
        if (!doseLogRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        doseLogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Dose log deleted successfully"));
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        return ResponseEntity.ok(sortByDate(appNotificationRepository.findAll(), AppNotification::getCreatedAt));
    }

    @PostMapping("/notifications")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> payload) {
        String recipientId = stringValue(payload.get("recipientId"));
        if (recipientId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Recipient is required"));
        }

        AppNotification notification = new AppNotification();
        notification.setRecipient(getUserById(recipientId, "Recipient"));

        String senderId = stringValue(payload.get("senderId"));
        if (!senderId.isBlank()) {
            notification.setSender(getUserById(senderId, "Sender"));
        }

        notification.setType(stringValue(payload.get("type")));
        notification.setTitle(stringValue(payload.get("title")));
        notification.setMessage(stringValue(payload.get("message")));
        notification.setReferenceType(stringValue(payload.get("referenceType")));
        notification.setReferenceId(stringValue(payload.get("referenceId")));
        notification.setRead(parseBoolean(payload.get("read"), false));

        return ResponseEntity.ok(appNotificationRepository.save(notification));
    }

    @PutMapping("/notifications/{id}")
    public ResponseEntity<?> updateNotification(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        AppNotification existing = appNotificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        String recipientId = stringValue(payload.get("recipientId"));
        if (!recipientId.isBlank()) {
            existing.setRecipient(getUserById(recipientId, "Recipient"));
        }
        String senderId = stringValue(payload.get("senderId"));
        if (!senderId.isBlank()) {
            existing.setSender(getUserById(senderId, "Sender"));
        }
        if (payload.containsKey("type")) existing.setType(stringValue(payload.get("type")));
        if (payload.containsKey("title")) existing.setTitle(stringValue(payload.get("title")));
        if (payload.containsKey("message")) existing.setMessage(stringValue(payload.get("message")));
        if (payload.containsKey("referenceType")) existing.setReferenceType(stringValue(payload.get("referenceType")));
        if (payload.containsKey("referenceId")) existing.setReferenceId(stringValue(payload.get("referenceId")));
        if (payload.containsKey("read")) existing.setRead(parseBoolean(payload.get("read"), existing.isRead()));

        return ResponseEntity.ok(appNotificationRepository.save(existing));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        if (!appNotificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        appNotificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User admin = getUserByEmail(authentication.getName());
        return ResponseEntity.ok(admin);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User payload, Authentication authentication) {
        User admin = getUserByEmail(authentication.getName());

        if (payload.getName() != null) admin.setName(payload.getName());
        if (payload.getPhoneNumber() != null) admin.setPhoneNumber(payload.getPhoneNumber());
        if (payload.getAddress() != null) admin.setAddress(payload.getAddress().trim());
        if (payload.getProfileImage() != null) admin.setProfileImage(payload.getProfileImage());

        admin.setRole(User.UserRole.ADMIN);
        return ResponseEntity.ok(userRepository.save(admin));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private User getUserById(String id, String label) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(label + " not found"));
    }

    private Prescription getPrescriptionById(String id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
    }

    private Reminder getReminderById(String id) {
        return reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
    }

    private <T> List<T> sortByDate(List<T> records, Function<T, LocalDateTime> dateGetter) {
        return records.stream()
                .sorted(Comparator.comparing(dateGetter, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    private User.UserRole parseRole(String rawRole) {
        try {
            return User.UserRole.valueOf(rawRole.trim().toUpperCase());
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid role: " + rawRole);
        }
    }

    private InventoryItem.InventoryStatus resolveInventoryStatus(
            InventoryItem.InventoryStatus explicitStatus,
            Integer quantity
    ) {
        if (explicitStatus != null) {
            return explicitStatus;
        }
        if (quantity == null) {
            return InventoryItem.InventoryStatus.IN_STOCK;
        }
        if (quantity <= 0) {
            return InventoryItem.InventoryStatus.OUT_OF_STOCK;
        }
        if (quantity <= 10) {
            return InventoryItem.InventoryStatus.LOW_STOCK;
        }
        return InventoryItem.InventoryStatus.IN_STOCK;
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String extractNestedId(Object value) {
        if (!(value instanceof Map<?, ?> nestedMap)) {
            return "";
        }
        Object nestedId = nestedMap.get("id");
        return stringValue(nestedId);
    }

    private List<String> parseTimes(Object value) {
        if (value instanceof List<?> list) {
            return list.stream()
                    .map(this::stringValue)
                    .filter(text -> !text.isBlank())
                    .toList();
        }
        String timesCsv = stringValue(value);
        if (timesCsv.isBlank()) {
            return new ArrayList<>();
        }
        String[] parts = timesCsv.split(",");
        List<String> times = new ArrayList<>();
        for (String part : parts) {
            String text = part.trim();
            if (!text.isBlank()) {
                times.add(text);
            }
        }
        return times;
    }

    private LocalDateTime parseDateTimeValue(Object value) {
        String text = stringValue(value);
        if (text.isBlank()) {
            return null;
        }
        if (text.length() == 16) {
            return LocalDateTime.parse(text + ":00");
        }
        return LocalDateTime.parse(text);
    }

    private String nullIfBlank(Object value) {
        String text = stringValue(value);
        return text.isBlank() ? null : text;
    }

    private boolean parseBoolean(Object value, boolean fallback) {
        if (value == null) {
            return fallback;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        String text = String.valueOf(value).trim();
        if (text.isBlank()) {
            return fallback;
        }
        return Boolean.parseBoolean(text);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
