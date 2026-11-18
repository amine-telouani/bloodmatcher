package com.bloodmatcher.bloodmatcher.service;


import com.bloodmatcher.bloodmatcher.dto.CreateRequestRequest;
import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import com.bloodmatcher.bloodmatcher.repository.BloodRequestRepository;
import com.bloodmatcher.bloodmatcher.repository.HospitalRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final HospitalRepository hospitalRepository;

    private LocalDateTime computeDeadline(Urgency urgency, LocalDateTime now) {
        return switch (urgency) {
            case CRITICAL -> now.plusHours(2);
            case URGENT -> now.plusHours(6);
            case NORMAL -> now.plusHours(24);
        };

    }

    @Transactional
    public BloodRequest createRequest(Hospital hospital, BloodType bloodType, int unitsNeeded, Urgency urgency) {
        LocalDateTime now = LocalDateTime.now();

        BloodRequest request = new BloodRequest();
        request.setHospital(hospital);
        request.setBloodType(bloodType);
        request.setUnitsNeeded(unitsNeeded);
        request.setUrgency(urgency);
        request.setStatus(RequestStatus.OPEN);
        request.setCurrentRadiusKm(5);
        request.setCreatedAt(now);
        request.setLastEscalationAt(now);
        request.setDeadline(computeDeadline(urgency, now));

        return bloodRequestRepository.save(request);
    }


    @Transactional
    public BloodRequest createRequestForUser(String email, CreateRequestRequest dto) {

        Hospital hospital = hospitalRepository.findByUserEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!hospital.isVerified()) {
            throw new AccessDeniedException("Hospital not verified");
        }

        return createRequest(hospital, dto.getBloodType(), dto.getUnitsNeeded(), dto.getUrgency());

    }

    @Transactional(readOnly = true)
    public BloodRequest getRequestForUser(Long id, String email) {
        BloodRequest request = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

       if (!request.getHospital().getUser().getEmail().equals(email)) {
           throw new AccessDeniedException("Not your request");
       }

        return request;
    }


}
