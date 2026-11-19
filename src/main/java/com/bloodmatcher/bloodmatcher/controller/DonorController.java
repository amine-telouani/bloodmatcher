package com.bloodmatcher.bloodmatcher.controller;

import com.bloodmatcher.bloodmatcher.dto.DonorAlertResponse;
import com.bloodmatcher.bloodmatcher.dto.DonorProfileResponse;
import com.bloodmatcher.bloodmatcher.dto.UpdateDonorRequest;
import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.service.DonorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonorProfileResponse> getProfile(Authentication authentication) {
        Donor donor = donorService.getProfile(authentication.getName());
        return ResponseEntity.ok(DonorProfileResponse.from(donor));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonorProfileResponse> updateMe(
            @Valid @RequestBody UpdateDonorRequest request,
            Authentication authentication) {
        Donor updated = donorService.updateDonor(authentication.getName(), request);
        return ResponseEntity.ok(DonorProfileResponse.from(updated));
    }

    @GetMapping("/me/alerts")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<DonorAlertResponse>> getAlerts(Authentication authentication) {
        List<DonorAlertResponse> alerts = donorService.getNotifiedAlerts(authentication.getName()).stream()
                .map(DonorAlertResponse::from)
                .toList();
        return ResponseEntity.ok(alerts);
    }
}
