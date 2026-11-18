package com.bloodmatcher.bloodmatcher.controller;

import com.bloodmatcher.bloodmatcher.dto.AuthResponse;
import com.bloodmatcher.bloodmatcher.dto.LoginRequest;
import com.bloodmatcher.bloodmatcher.dto.RegisterDonorRequest;
import com.bloodmatcher.bloodmatcher.dto.RegisterHospitalRequest;
import com.bloodmatcher.bloodmatcher.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/donor")
    public ResponseEntity<AuthResponse> registerDonor(@Valid @RequestBody RegisterDonorRequest request) {
        AuthResponse response = authService.registerDonor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/hospital")
    public ResponseEntity<AuthResponse> registerHospital(@Valid @RequestBody RegisterHospitalRequest request) {
        AuthResponse response = authService.registerHospital(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

}
