package com.medtrack.controller;

import com.medtrack.dto.AuthResponse;
import com.medtrack.dto.LoginRequest;
import com.medtrack.dto.SignupRequest;
import com.medtrack.dto.UpdateProfileRequest;
import com.medtrack.model.User;
import com.medtrack.repository.UserRepository;
import com.medtrack.security.CustomUserDetailsService;
import com.medtrack.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${google.client-id:}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String normalizedEmail = loginRequest.getEmail() == null ? "" : loginRequest.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail,
                        loginRequest.getPassword()));

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String credential = request.get("credential");
        String fallbackEmail = stringValue(request.get("email")).toLowerCase();
        String fallbackName = stringValue(request.get("name"));

        // Dev fallback: allow "Google-like" login without credential when client-id is not configured.
        if ((credential == null || credential.isBlank()) && googleClientId.isBlank()) {
            if (fallbackEmail.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required for development Google login"));
            }
            User user = userRepository.findByEmail(fallbackEmail).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(fallbackEmail);
                newUser.setName(fallbackName.isBlank() ? fallbackEmail.split("@")[0] : fallbackName);
                newUser.setEnabled(true);
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                return userRepository.save(newUser);
            });
            return ResponseEntity.ok(createAuthResponseForUser(user));
        }

        if (credential == null || credential.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Google credential is required"));
        }

        Map<?, ?> tokenInfo;
        try {
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token="
                    + URLEncoder.encode(credential, StandardCharsets.UTF_8);
            tokenInfo = restTemplate.getForObject(tokenInfoUrl, Map.class);
        } catch (RestClientException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid Google token"));
        }

        if (tokenInfo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unable to validate Google token"));
        }

        String email = stringValue(tokenInfo.get("email")).toLowerCase();
        String name = stringValue(tokenInfo.get("name"));
        String picture = stringValue(tokenInfo.get("picture"));
        String audience = stringValue(tokenInfo.get("aud"));
        boolean emailVerified = Boolean.parseBoolean(stringValue(tokenInfo.get("email_verified")));

        if (email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Google account email not available"));
        }
        if (!emailVerified) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Google email is not verified"));
        }
        if (!googleClientId.isBlank() && !googleClientId.equals(audience)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Google client mismatch"));
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name.isBlank() ? email.split("@")[0] : name);
            newUser.setEnabled(true);
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            if (!picture.isBlank()) {
                newUser.setProfileImage(picture);
            }
            return userRepository.save(newUser);
        });

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        }
        if ((user.getProfileImage() == null || user.getProfileImage().isBlank()) && !picture.isBlank()) {
            user.setProfileImage(picture);
        }
        userRepository.save(user);

        return ResponseEntity.ok(createAuthResponseForUser(user));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        Map<String, String> response = new HashMap<>();

        if (signupRequest.getName() == null || signupRequest.getName().trim().isEmpty()) {
            response.put("message", "Name is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (signupRequest.getEmail() == null || signupRequest.getEmail().trim().isEmpty()) {
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (signupRequest.getPassword() == null || signupRequest.getPassword().trim().isEmpty()) {
            response.put("message", "Password is required");
            return ResponseEntity.badRequest().body(response);
        }

        String normalizedEmail = signupRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            response.put("message", "Email already exists");
            return ResponseEntity.badRequest().body(response);
        }

        User user = new User();
        user.setName(signupRequest.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setEnabled(true);

        try {
            userRepository.save(user);
        } catch (DuplicateKeyException ex) {
            response.put("message", "Email already exists");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception ex) {
            response.put("message", "Failed to create account");
            return ResponseEntity.internalServerError().body(response);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, signupRequest.getPassword()));
        String token = tokenProvider.generateToken(authentication);
        User createdUser = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new AuthResponse(token, createdUser));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        String normalizedEmail = email.trim().toLowerCase();
        Optional<User> optionalUser = userRepository.findByEmail(normalizedEmail);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been generated."));
        }

        User user = optionalUser.get();
        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset link generated successfully.");
        response.put("resetLink", resetLink);
        response.put("expiresAt", user.getPasswordResetTokenExpiry().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reset token is required"));
        }
        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters"));
        }

        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getPasswordResetTokenExpiry() == null || user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reset token has expired"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully.");
        response.put("email", user.getEmail());
        response.put("updatedAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest profileData,
                                           Authentication authentication) {
        if (authentication == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Authentication required");
            return ResponseEntity.status(401).body(response);
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update common fields
        if (profileData.getName() != null) {
            user.setName(profileData.getName());
        }
        if (profileData.getPhoneNumber() != null) {
            user.setPhoneNumber(profileData.getPhoneNumber());
        }
        if (profileData.getDateOfBirth() != null) {
            user.setDateOfBirth(profileData.getDateOfBirth());
        }
        if (profileData.getAddress() != null) {
            user.setAddress(profileData.getAddress());
        }
        if (profileData.getRole() != null) {
            user.setRole(profileData.getRole());
        }

        // Update role-specific fields
        if (profileData.getRole() == User.UserRole.PATIENT) {
            if (profileData.getMedicalHistory() != null) {
                user.setMedicalHistory(profileData.getMedicalHistory());
            }
            if (profileData.getAllergies() != null) {
                user.setAllergies(profileData.getAllergies());
            }
            if (profileData.getEmergencyContact() != null) {
                user.setEmergencyContact(profileData.getEmergencyContact());
            }
        } else if (profileData.getRole() == User.UserRole.DOCTOR) {
            if (profileData.getLicenseNumber() != null) {
                user.setLicenseNumber(profileData.getLicenseNumber());
            }
            if (profileData.getSpecialization() != null) {
                user.setSpecialization(profileData.getSpecialization());
            }
        } else if (profileData.getRole() == User.UserRole.PHARMACIST) {
            if (profileData.getLicenseNumber() != null) {
                user.setLicenseNumber(profileData.getLicenseNumber());
            }
        }

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private AuthResponse createAuthResponseForUser(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, user);
    }
}
