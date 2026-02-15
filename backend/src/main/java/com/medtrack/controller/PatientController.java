package com.medtrack.controller;

import com.medtrack.model.AppNotification;
import com.medtrack.model.DoseLog;
import com.medtrack.model.Prescription;
import com.medtrack.model.RefillRequest;
import com.medtrack.model.Reminder;
import com.medtrack.model.User;
import com.medtrack.repository.AppNotificationRepository;
import com.medtrack.repository.DoseLogRepository;
import com.medtrack.repository.PrescriptionRepository;
import com.medtrack.repository.RefillRequestRepository;
import com.medtrack.repository.ReminderRepository;
import com.medtrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private DoseLogRepository doseLogRepository;

    @Autowired
    private RefillRequestRepository refillRequestRepository;

    @Autowired
    private AppNotificationRepository appNotificationRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);

        List<Prescription> prescriptions = prescriptionRepository.findByPatient(user);
        List<Reminder> reminders = reminderRepository.findByPatientAndActiveTrue(user);

        LocalDate today = LocalDate.now();
        LocalDateTime startOfWeek = today.minusDays(6).atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);

        List<DoseLog> weeklyLogs = doseLogRepository.findByPatientAndScheduledAtBetween(user, startOfWeek, endOfToday);
        int dosesTaken = (int) weeklyLogs.stream().filter(log -> log.getStatus() == DoseLog.DoseStatus.TAKEN).count();
        int totalScheduled = 0;
        for (int i = 0; i < 7; i++) {
            totalScheduled += countScheduledDosesForDate(reminders, today.minusDays(i));
        }

        int adherenceRate = totalScheduled == 0 ? 0 : (int) Math.round((dosesTaken * 100.0) / totalScheduled);
        int dueToday = countScheduledDosesForDate(reminders, today);
        int takenToday = (int) weeklyLogs.stream()
                .filter(log -> log.getStatus() == DoseLog.DoseStatus.TAKEN)
                .filter(log -> log.getScheduledAt() != null && log.getScheduledAt().toLocalDate().equals(today))
                .count();
        int missedToday = Math.max(dueToday - takenToday, 0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("patientName", user.getName());
        stats.put("activeMedications", prescriptions.stream()
                .filter(p -> p.getStatus() == Prescription.PrescriptionStatus.ACTIVE)
                .count());
        stats.put("dueMedications", dueToday);
        stats.put("missedDoses", missedToday);
        stats.put("adherenceRate", adherenceRate);
        stats.put("unreadNotifications", appNotificationRepository.countByRecipientAndReadFalse(user));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptions(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        List<Prescription> prescriptions = prescriptionRepository.findByPatient(user);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<?> getPrescriptionById(@PathVariable String id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!prescription.getPatient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        return ResponseEntity.ok(prescription);
    }

    @PostMapping("/prescriptions/{id}/refill-request")
    public ResponseEntity<?> createRefillRequest(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            Authentication authentication
    ) {
        User patient = getUserFromAuthentication(authentication);
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!prescription.getPatient().getId().equals(patient.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }
        if (prescription.getRefillsRemaining() == null || prescription.getRefillsRemaining() <= 0) {
            return ResponseEntity.badRequest().body("No refills remaining for this prescription");
        }
        if (refillRequestRepository.existsByPrescriptionAndStatusIn(
                prescription,
                Arrays.asList(
                        RefillRequest.RefillStatus.REQUESTED,
                        RefillRequest.RefillStatus.PROCESSING,
                        RefillRequest.RefillStatus.READY
                ))) {
            return ResponseEntity.badRequest().body("A refill request is already active for this prescription");
        }

        List<User> pharmacists = userRepository.findByRole(User.UserRole.PHARMACIST);
        if (pharmacists.isEmpty()) {
            return ResponseEntity.badRequest().body("No pharmacist account is currently available");
        }

        RefillRequest refillRequest = new RefillRequest();
        refillRequest.setPatient(patient);
        refillRequest.setPrescription(prescription);
        refillRequest.setPharmacist(pharmacists.get(0));
        refillRequest.setStatus(RefillRequest.RefillStatus.REQUESTED);
        refillRequest.setNote(payload == null ? null : payload.get("note"));
        RefillRequest savedRequest = refillRequestRepository.save(refillRequest);

        createNotification(
                pharmacists.get(0),
                patient,
                "REFILL_REQUEST",
                "New Refill Request",
                patient.getName() + " requested a refill for prescription " + prescription.getId(),
                "REFILL_REQUEST",
                savedRequest.getId()
        );
        createNotification(
                patient,
                pharmacists.get(0),
                "REFILL_REQUEST",
                "Refill Requested",
                "Your refill request has been sent to the pharmacist.",
                "REFILL_REQUEST",
                savedRequest.getId()
        );

        return ResponseEntity.ok(savedRequest);
    }

    @GetMapping("/refill-requests")
    public ResponseEntity<?> getRefillRequests(Authentication authentication) {
        User patient = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(refillRequestRepository.findByPatientOrderByCreatedAtDesc(patient));
    }

    @GetMapping("/reminders")
    public ResponseEntity<?> getReminders(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        List<Reminder> reminders = reminderRepository.findByPatient(user);
        return ResponseEntity.ok(reminders);
    }

    @PostMapping("/reminders")
    public ResponseEntity<?> createReminder(@RequestBody Reminder reminder, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        reminder.setPatient(user);
        reminder.setActive(true);
        if (reminder.getStartDate() == null) {
            reminder.setStartDate(LocalDate.now().atStartOfDay());
        }
        Reminder savedReminder = reminderRepository.save(reminder);

        createNotification(
                user,
                user,
                "REMINDER_CREATED",
                "Reminder Created",
                "Reminder added for " + savedReminder.getMedicineName(),
                "REMINDER",
                savedReminder.getId()
        );

        return ResponseEntity.ok(savedReminder);
    }

    @PostMapping("/reminders/{id}/log-dose")
    public ResponseEntity<?> logDose(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            Authentication authentication
    ) {
        User user = getUserFromAuthentication(authentication);
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        if (!reminder.getPatient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        LocalDateTime scheduledAt = LocalDateTime.now();
        if (payload != null && payload.get("scheduledAt") != null && !payload.get("scheduledAt").isBlank()) {
            scheduledAt = LocalDateTime.parse(payload.get("scheduledAt"));
        }

        DoseLog doseLog = new DoseLog();
        doseLog.setPatient(user);
        doseLog.setReminder(reminder);
        doseLog.setScheduledAt(scheduledAt);
        doseLog.setTakenAt(LocalDateTime.now());
        doseLog.setStatus(DoseLog.DoseStatus.TAKEN);

        DoseLog savedLog = doseLogRepository.save(doseLog);
        return ResponseEntity.ok(savedLog);
    }

    @PutMapping("/reminders/{id}")
    public ResponseEntity<?> updateReminder(@PathVariable String id, @RequestBody Reminder reminder, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Reminder existingReminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        if (!existingReminder.getPatient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        existingReminder.setMedicineName(reminder.getMedicineName());
        existingReminder.setDosage(reminder.getDosage());
        existingReminder.setFrequency(reminder.getFrequency());
        existingReminder.setTimes(reminder.getTimes());
        existingReminder.setStartDate(reminder.getStartDate());
        existingReminder.setEndDate(reminder.getEndDate());
        existingReminder.setInstructions(reminder.getInstructions());
        existingReminder.setActive(reminder.isActive());

        Reminder updatedReminder = reminderRepository.save(existingReminder);
        return ResponseEntity.ok(updatedReminder);
    }

    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable String id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        if (!reminder.getPatient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        reminderRepository.delete(reminder);
        return ResponseEntity.ok("Reminder deleted successfully");
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getHealthAnalytics(Authentication authentication) {
        User patient = getUserFromAuthentication(authentication);
        List<Reminder> activeReminders = reminderRepository.findByPatientAndActiveTrue(patient);

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = today.atTime(LocalTime.MAX);

        List<DoseLog> logs = doseLogRepository.findByPatientAndScheduledAtBetween(patient, startDateTime, endDateTime);
        Map<LocalDate, List<DoseLog>> logsByDate = logs.stream()
                .filter(log -> log.getScheduledAt() != null)
                .collect(Collectors.groupingBy(log -> log.getScheduledAt().toLocalDate()));

        List<Map<String, Object>> weeklyTrend = new ArrayList<>();
        int totalTaken = 0;
        int totalScheduled = 0;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int scheduled = countScheduledDosesForDate(activeReminders, date);
            int taken = (int) logsByDate.getOrDefault(date, Collections.emptyList())
                    .stream()
                    .filter(log -> log.getStatus() == DoseLog.DoseStatus.TAKEN)
                    .count();
            int missed = Math.max(scheduled - taken, 0);
            int dailyAdherence = scheduled == 0 ? 0 : (int) Math.round((taken * 100.0) / scheduled);

            totalTaken += taken;
            totalScheduled += scheduled;

            Map<String, Object> dayPoint = new HashMap<>();
            dayPoint.put("day", formatter.format(date));
            dayPoint.put("date", date.toString());
            dayPoint.put("adherence", dailyAdherence);
            dayPoint.put("taken", taken);
            dayPoint.put("missed", missed);
            dayPoint.put("scheduled", scheduled);
            weeklyTrend.add(dayPoint);
        }

        int adherenceRate = totalScheduled == 0 ? 0 : (int) Math.round((totalTaken * 100.0) / totalScheduled);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("adherenceRate", adherenceRate);
        analytics.put("dosesTaken", totalTaken);
        analytics.put("missedDoses", Math.max(totalScheduled - totalTaken, 0));
        analytics.put("activeReminders", activeReminders.size());
        analytics.put("weeklyTrend", weeklyTrend);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(appNotificationRepository.findByRecipientOrderByCreatedAtDesc(user));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable String id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        AppNotification notification = appNotificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }
        notification.setRead(true);
        return ResponseEntity.ok(appNotificationRepository.save(notification));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User profileData, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);

        if (profileData.getName() != null) user.setName(profileData.getName());
        if (profileData.getPhoneNumber() != null) user.setPhoneNumber(profileData.getPhoneNumber());
        if (profileData.getDateOfBirth() != null) user.setDateOfBirth(profileData.getDateOfBirth());
        if (profileData.getAddress() != null) user.setAddress(profileData.getAddress().trim());
        if (profileData.getProfileImage() != null) user.setProfileImage(profileData.getProfileImage());

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/medical-info")
    public ResponseEntity<?> updateMedicalInfo(@RequestBody User medicalInfo, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);

        if (medicalInfo.getMedicalHistory() != null) user.setMedicalHistory(medicalInfo.getMedicalHistory());
        if (medicalInfo.getAllergies() != null) user.setAllergies(medicalInfo.getAllergies());
        if (medicalInfo.getEmergencyContact() != null) user.setEmergencyContact(medicalInfo.getEmergencyContact());

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    private int countScheduledDosesForDate(List<Reminder> reminders, LocalDate date) {
        return reminders.stream()
                .filter(reminder -> reminder.isActive())
                .filter(reminder -> reminder.getStartDate() == null || !date.isBefore(reminder.getStartDate().toLocalDate()))
                .filter(reminder -> reminder.getEndDate() == null || !date.isAfter(reminder.getEndDate().toLocalDate()))
                .mapToInt(reminder -> reminder.getTimes() == null ? 0 : reminder.getTimes().size())
                .sum();
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
}
