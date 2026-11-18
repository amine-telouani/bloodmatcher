package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.entity.User;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResponseServiceTest {

    @Mock
    private DonorResponseRepository donorResponseRepository;

    @InjectMocks
    private ResponseService responseService;

    @Test
    void acceptUnknownResponseThrowsNotFound() {
        when(donorResponseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> responseService.accept(99L, "donor@test.com"));
    }

    @Test
    void acceptWrongDonorThrowsAccessDenied() {
        DonorResponse response = response("donor@test.com");
        response.getDonor().getUser().setEmail("other@test.com");
        when(donorResponseRepository.findById(1L)).thenReturn(Optional.of(response));

        assertThrows(AccessDeniedException.class,
                () -> responseService.accept(1L, "donor@test.com"));
    }

    @Test
    void acceptAnsweredResponseThrowsConflict() {
        DonorResponse response = response("donor@test.com");
        response.setStatus(ResponseStatus.ACCEPTED);
        when(donorResponseRepository.findById(1L)).thenReturn(Optional.of(response));

        assertThrows(IllegalStateException.class,
                () -> responseService.accept(1L, "donor@test.com"));
    }

    @Test
    void acceptSetsStatusAndRespondedAt() {
        DonorResponse response = response("donor@test.com");
        when(donorResponseRepository.findById(1L)).thenReturn(Optional.of(response));

        DonorResponse updated = responseService.accept(1L, "donor@test.com");

        assertEquals(ResponseStatus.ACCEPTED, updated.getStatus());
        assertEquals(java.time.LocalDateTime.now().toLocalDate(),
                updated.getRespondedAt().toLocalDate());
    }

    @Test
    void declineSetsStatusAndRespondedAt() {
        DonorResponse response = response("donor@test.com");
        when(donorResponseRepository.findById(1L)).thenReturn(Optional.of(response));

        DonorResponse updated = responseService.decline(1L, "donor@test.com");

        assertEquals(ResponseStatus.DECLINED, updated.getStatus());
        assertEquals(java.time.LocalDateTime.now().toLocalDate(),
                updated.getRespondedAt().toLocalDate());
    }

    @Test
    void declineWrongStatusThrowsConflict() {
        DonorResponse response = response("donor@test.com");
        response.setStatus(ResponseStatus.DECLINED);
        when(donorResponseRepository.findById(1L)).thenReturn(Optional.of(response));

        assertThrows(IllegalStateException.class,
                () -> responseService.decline(1L, "donor@test.com"));
    }

    @Test
    void donatedWrongHospitalThrowsAccessDenied() {
        DonorResponse response = response("donor@test.com");
        response.setStatus(ResponseStatus.ACCEPTED);
        response.getRequest().getHospital().getUser().setEmail("other-hospital@test.com");
        when(donorResponseRepository.findById(1L)).thenReturn(Optional.of(response));

        assertThrows(AccessDeniedException.class,
                () -> responseService.donated(1L, "hospital@test.com"));
    }

    @Test
    void donatedSetsLastDonationDateToToday() {
        DonorResponse response = response("donor@test.com");
        response.setStatus(ResponseStatus.ACCEPTED);
        response.getRequest().getHospital().getUser().setEmail("hospital@test.com");
        when(donorResponseRepository.findById(1L)).thenReturn(Optional.of(response));

        DonorResponse updated = responseService.donated(1L, "hospital@test.com");

        assertEquals(ResponseStatus.DONATED, updated.getStatus());
        assertEquals(LocalDate.now(), updated.getDonor().getLastDonationDate());
    }

    private DonorResponse response(String donorEmail) {
        User donorUser = new User();
        donorUser.setEmail(donorEmail);

        Donor donor = new Donor();
        donor.setUser(donorUser);

        User hospitalUser = new User();
        hospitalUser.setEmail("hospital@test.com");

        Hospital hospital = new Hospital();
        hospital.setUser(hospitalUser);

        BloodRequest request = new BloodRequest();
        request.setHospital(hospital);

        DonorResponse response = new DonorResponse();
        response.setId(1L);
        response.setRequest(request);
        response.setDonor(donor);
        response.setStatus(ResponseStatus.NOTIFIED);
        return response;
    }
}
