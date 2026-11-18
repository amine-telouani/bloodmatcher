package com.bloodmatcher.bloodmatcher.controller;

import com.bloodmatcher.bloodmatcher.dto.CreateRequestRequest;
import com.bloodmatcher.bloodmatcher.dto.RequestResponse;
import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<RequestResponse> create(@Valid @RequestBody CreateRequestRequest request, Authentication authentication) {

        BloodRequest created = requestService.createRequestForUser(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(RequestResponse.from(created));

    }

}
