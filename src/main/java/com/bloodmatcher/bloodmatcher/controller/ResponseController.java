package com.bloodmatcher.bloodmatcher.controller;

import com.bloodmatcher.bloodmatcher.dto.ResponseActionResponse;
import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.service.ResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/responses")
@RequiredArgsConstructor
public class ResponseController {

    private final ResponseService responseService;

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ResponseActionResponse> accept(
            @PathVariable Long id,
            Authentication authentication) {
        DonorResponse response = responseService.accept(id, authentication.getName());
        return ResponseEntity.ok(ResponseActionResponse.from(response));
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ResponseActionResponse> decline(
            @PathVariable Long id,
            Authentication authentication) {
        DonorResponse response = responseService.decline(id, authentication.getName());
        return ResponseEntity.ok(ResponseActionResponse.from(response));
    }

    @PostMapping("/{id}/donated")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ResponseActionResponse> donated(
            @PathVariable Long id,
            Authentication authentication) {
        DonorResponse response = responseService.donated(id, authentication.getName());
        return ResponseEntity.ok(ResponseActionResponse.from(response));
    }
}
