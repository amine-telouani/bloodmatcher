package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.dto.AdminStatsResponse;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.repository.BloodRequestRepository;
import com.bloodmatcher.bloodmatcher.repository.DonorRepository;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import com.bloodmatcher.bloodmatcher.repository.HospitalRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final HospitalRepository hospitalRepository;
    private final DonorRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final DonorResponseRepository donorResponseRepository;

    @Transactional
    public Hospital verifyHospital(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hospital not found"));
        hospital.setVerified(true);
        return hospital;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        return new AdminStatsResponse(
                donorRepository.count(),
                hospitalRepository.count(),
                hospitalRepository.countByVerifiedTrue(),
                bloodRequestRepository.count(),
                bloodRequestRepository.countByStatus(RequestStatus.OPEN),
                bloodRequestRepository.countByStatus(RequestStatus.FULFILLED),
                donorResponseRepository.countByStatus(ResponseStatus.DONATED)
        );
    }
}
