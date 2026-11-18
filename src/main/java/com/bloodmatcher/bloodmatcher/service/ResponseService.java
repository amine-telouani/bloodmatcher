package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ResponseService {

    private final DonorResponseRepository donorResponseRepository;

    @Transactional
    public DonorResponse accept(Long id, String email) {
        DonorResponse response = getResponseForDonor(id, email);
        ensureNotAnswered(response);
        response.setStatus(ResponseStatus.ACCEPTED);
        response.setRespondedAt(LocalDateTime.now());
        return response;
    }

    @Transactional
    public DonorResponse decline(Long id, String email) {
        DonorResponse response = getResponseForDonor(id, email);
        ensureNotAnswered(response);
        response.setStatus(ResponseStatus.DECLINED);
        response.setRespondedAt(LocalDateTime.now());
        return response;
    }

    @Transactional
    public DonorResponse donated(Long id, String email) {
        DonorResponse response = donorResponseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Response not found"));

        if (!response.getRequest().getHospital().getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Not your request");
        }
        if (response.getStatus() != ResponseStatus.ACCEPTED) {
            throw new IllegalStateException("Donor has not accepted");
        }

        response.setStatus(ResponseStatus.DONATED);
        response.getDonor().setLastDonationDate(LocalDate.now());
        return response;
    }

    private DonorResponse getResponseForDonor(Long id, String email) {
        DonorResponse response = donorResponseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Response not found"));

        if (!response.getDonor().getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Not your response");
        }
        return response;
    }

    private void ensureNotAnswered(DonorResponse response) {
        if (response.getStatus() != ResponseStatus.NOTIFIED) {
            throw new IllegalStateException("Response already answered");
        }
    }
}
