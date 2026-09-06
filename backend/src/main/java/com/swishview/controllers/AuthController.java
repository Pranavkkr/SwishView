package com.swishview.controllers;

import com.swishview.dto.AuthResponse;
import com.swishview.dto.LoginRequest;
import com.swishview.entity.User;
import com.swishview.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.swishview.dto.SignupRequest;
import com.swishview.repositories.UserRepository;
import com.swishview.entity.Role;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.admin.code}")
    private String adminCode;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        
        try {
            Role requestedRole = Role.valueOf(signUpRequest.getRole().toUpperCase());
            if (requestedRole == Role.MANAGER) {
                if (signUpRequest.getAdminCode() != null && signUpRequest.getAdminCode().equals(adminCode)) {
                    user.setRole(Role.MANAGER);
                } else {
                    user.setRole(Role.EMPLOYEE);
                }
            } else {
                user.setRole(requestedRole);
            }
        } catch (Exception e) {
            user.setRole(Role.EMPLOYEE);
        }

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        User userDetails = (User) authentication.getPrincipal();

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getRole()
        ));
    }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody java.util.Map<String, String> request, Authentication authentication) {
        String currentEmail = authentication.getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByEmail(currentEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        String currentEmail = authentication.getName();
        User user = userRepository.findByEmail(currentEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, String> request, Authentication authentication) {
        String currentEmail = authentication.getName();
        User user = userRepository.findByEmail(currentEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (request.containsKey("name")) {
            user.setName(request.get("name"));
        }
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
