package com.medtrack.controller;

import com.medtrack.model.AppNotification;
import com.medtrack.model.Prescription;
import com.medtrack.model.RefillRequest;
import com.medtrack.model.User;
import com.medtrack.repository.AppNotificationRepository;
import com.medtrack.repository.PrescriptionRepository;
import com.medtrack.repository.RefillRequestRepository;
import com.medtrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private RefillRequestRepository refillRequestRepository;

    @Autowired
    private AppNotificationRepository appNotificationRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        User doctor = getUserFromAuthentication(authentication);

        List<Prescription> prescriptions = prescriptionRepository.findByDoctor(doctor);
        List<User> patients = userRepository.findByRole(User.UserRole.PATIENT);
        long thisMonth = prescriptions.stream()
                .filter(p -> p.getCreatedAt() != null)
                .filter(p -> p.getCreatedAt().getMonth() == LocalDate.now().getMonth())
                .filter(p -> p.getCreatedAt().getYear() == LocalDate.now().getYear())
                .count();
        long pendingReviews = refillRequestRepository.findByStatusOrderByCreatedAtDesc(RefillRequest.RefillStatus.REQUESTED).size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", patients.size());
        stats.put("activePrescriptions", prescriptions.stream()
                .filter(p -> p.getStatus() == Prescription.PrescriptionStatus.ACTIVE)
                .count());
        stats.put("pendingReviews", pendingReviews);
        stats.put("thisMonth", thisMonth);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getPatients(Authentication authentication) {
        List<User> patients = userRepository.findByRole(User.UserRole.PATIENT);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable String id) {
        User patient = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/patients/search")
    public ResponseEntity<?> searchPatients(@RequestParam String q) {
        String query = q == null ? "" : q.toLowerCase().trim();
        List<User> patients = userRepository.findByRole(User.UserRole.PATIENT);
        List<User> filtered = patients.stream()
                .filter(patient -> patient.getName() != null && patient.getName().toLowerCase().contains(query)
                        || patient.getEmail() != null && patient.getEmail().toLowerCase().contains(query))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptions(Authentication authentication) {
        User doctor = getUserFromAuthentication(authentication);
        List<Prescription> prescriptions = prescriptionRepository.findByDoctor(doctor);
        return ResponseEntity.ok(prescriptions);
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<?> createPrescription(@RequestBody Prescription prescription, Authentication authentication) {
        User doctor = getUserFromAuthentication(authentication);
        if (prescription.getPatient() == null || prescription.getPatient().getId() == null) {
            return ResponseEntity.badRequest().body("Patient is required");
        }

        User patient = userRepository.findById(prescription.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        prescription.setDoctor(doctor);
        prescription.setPatient(patient);
        prescription.setDoctorApproved(true);
        if (prescription.getRefillLimit() == null) {
            prescription.setRefillLimit(0);
        }
        if (prescription.getRefillsRemaining() == null) {
            prescription.setRefillsRemaining(prescription.getRefillLimit());
        }
        if (prescription.getStatus() == null) {
            prescription.setStatus(Prescription.PrescriptionStatus.ACTIVE);
        }

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        createNotification(
                patient,
                doctor,
                "PRESCRIPTION_CREATED",
                "New Prescription",
                "Dr. " + doctor.getName() + " created a new prescription for you.",
                "PRESCRIPTION",
                savedPrescription.getId()
        );

        List<User> pharmacists = userRepository.findByRole(User.UserRole.PHARMACIST);
        for (User pharmacist : pharmacists) {
            createNotification(
                    pharmacist,
                    doctor,
                    "PRESCRIPTION_CREATED",
                    "Prescription Ready for Fulfillment",
                    "A new prescription for " + patient.getName() + " has been issued.",
                    "PRESCRIPTION",
                    savedPrescription.getId()
            );
        }

        return ResponseEntity.ok(savedPrescription);
    }

    @PutMapping("/prescriptions/{id}")
    public ResponseEntity<?> updatePrescription(@PathVariable String id, @RequestBody Prescription prescription, Authentication authentication) {
        User doctor = getUserFromAuthentication(authentication);
        Prescription existingPrescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!existingPrescription.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        existingPrescription.setMedications(prescription.getMedications());
        existingPrescription.setDiagnosis(prescription.getDiagnosis());
        existingPrescription.setNotes(prescription.getNotes());
        existingPrescription.setStatus(prescription.getStatus());
        existingPrescription.setRefillLimit(prescription.getRefillLimit());
        existingPrescription.setRefillsRemaining(prescription.getRefillsRemaining());
        existingPrescription.setValidUntil(prescription.getValidUntil());

        Prescription updatedPrescription = prescriptionRepository.save(existingPrescription);
        return ResponseEntity.ok(updatedPrescription);
    }

    @DeleteMapping("/prescriptions/{id}")
    public ResponseEntity<?> deletePrescription(@PathVariable String id, Authentication authentication) {
        User doctor = getUserFromAuthentication(authentication);
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (!prescription.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        prescriptionRepository.delete(prescription);
        return ResponseEntity.ok("Prescription deleted successfully");
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getPracticeAnalytics(Authentication authentication) {
        User doctor = getUserFromAuthentication(authentication);
        List<Prescription> prescriptions = prescriptionRepository.findByDoctor(doctor);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalPatients", userRepository.findByRole(User.UserRole.PATIENT).size());
        analytics.put("activePrescriptions", prescriptions.stream()
                .filter(p -> p.getStatus() == Prescription.PrescriptionStatus.ACTIVE)
                .count());
        analytics.put("consultations", prescriptions.size());
        analytics.put("revenue", prescriptions.size() * 50);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User doctor = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(doctor);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User profileData, Authentication authentication) {
        User doctor = getUserFromAuthentication(authentication);

        if (profileData.getName() != null) doctor.setName(profileData.getName());
        if (profileData.getPhoneNumber() != null) doctor.setPhoneNumber(profileData.getPhoneNumber());
        if (profileData.getAddress() != null) doctor.setAddress(profileData.getAddress().trim());
        if (profileData.getLicenseNumber() != null) doctor.setLicenseNumber(profileData.getLicenseNumber());
        if (profileData.getSpecialization() != null) doctor.setSpecialization(profileData.getSpecialization());
        if (profileData.getProfileImage() != null) doctor.setProfileImage(profileData.getProfileImage());

        userRepository.save(doctor);
        return ResponseEntity.ok(doctor);
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
