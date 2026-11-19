package com.bloodmatcher.bloodmatcher.controller;

import com.bloodmatcher.bloodmatcher.dto.AdminStatsResponse;
import com.bloodmatcher.bloodmatcher.dto.HospitalVerificationResponse;
import com.bloodmatcher.bloodmatcher.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @PutMapping("/hospitals/{id}/verify")
    public ResponseEntity<HospitalVerificationResponse> verifyHospital(@PathVariable Long id) {
        return ResponseEntity.ok(HospitalVerificationResponse.from(adminService.verifyHospital(id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}
