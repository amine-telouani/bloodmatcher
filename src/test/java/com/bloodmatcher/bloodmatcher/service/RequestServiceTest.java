package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.dto.CreateRequestRequest;
import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import com.bloodmatcher.bloodmatcher.repository.BloodRequestRepository;
import com.bloodmatcher.bloodmatcher.repository.HospitalRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RequestServiceTest {

    @Mock
    private BloodRequestRepository bloodRequestRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private MatchingService matchingService;

    @InjectMocks
    private RequestService requestService;

    @Test
    void verifiedHospitalNotifiesExactlyOnce() {
        Hospital hospital = new Hospital();
        hospital.setVerified(true);

        CreateRequestRequest dto = new CreateRequestRequest();
        dto.setBloodType(BloodType.A_POS);
        dto.setUnitsNeeded(1);
        dto.setUrgency(Urgency.NORMAL);

        when(hospitalRepository.findByUserEmail("hospital@test.com"))
                .thenReturn(Optional.of(hospital));
        when(bloodRequestRepository.save(any(BloodRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BloodRequest result = requestService.createRequestForUser("hospital@test.com", dto);

        assertEquals(hospital, result.getHospital());
        verify(matchingService).notifyDonors(result);
    }

    @Test
    void unverifiedHospitalThrowsAndDoesNotNotify() {
        Hospital hospital = new Hospital();
        hospital.setVerified(false);

        CreateRequestRequest dto = new CreateRequestRequest();
        dto.setBloodType(BloodType.A_POS);
        dto.setUnitsNeeded(1);
        dto.setUrgency(Urgency.NORMAL);

        when(hospitalRepository.findByUserEmail("hospital@test.com"))
                .thenReturn(Optional.of(hospital));

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> requestService.createRequestForUser("hospital@test.com", dto));

        assertEquals("Hospital not verified", exception.getMessage());
        verify(bloodRequestRepository, never()).save(any(BloodRequest.class));
        verify(matchingService, never()).notifyDonors(any(BloodRequest.class));
    }
}
