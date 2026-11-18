package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.repository.DonorRepository;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import com.bloodmatcher.bloodmatcher.dto.UpdateDonorRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;
    private final DonorResponseRepository donorResponseRepository;

    @Transactional(readOnly = true)
    public Donor getDonorForUser(String email) {
        return donorRepository.findByUserEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Donor not found"));
    }

    @Transactional
    public Donor updateDonor(String email, UpdateDonorRequest request) {
        Donor donor = getDonorForUser(email);
        donor.setLatitude(request.getLatitude());
        donor.setLongitude(request.getLongitude());
        donor.setAvailable(request.getAvailable());
        donor.setPhone(request.getPhone());
        return donor;
    }

    @Transactional(readOnly = true)
    public List<DonorResponse> getNotifiedAlerts(String email) {
        getDonorForUser(email);
        return donorResponseRepository.findByDonorUserEmailAndStatus(email, ResponseStatus.NOTIFIED);
    }
}
