package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.dto.UpdateDonorRequest;
import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.repository.DonorRepository;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DonorServiceTest {

    @Mock
    private DonorRepository donorRepository;

    @Mock
    private DonorResponseRepository donorResponseRepository;

    @InjectMocks
    private DonorService donorService;

    @Test
    void updatesDonorLocationAvailabilityAndPhone() {
        Donor donor = new Donor();
        when(donorRepository.findByUserEmail("donor@test.com"))
                .thenReturn(Optional.of(donor));

        UpdateDonorRequest request = new UpdateDonorRequest();
        request.setLatitude(33.5731);
        request.setLongitude(-7.5898);
        request.setAvailable(false);
        request.setPhone("0612345678");

        Donor updated = donorService.updateDonor("donor@test.com", request);

        assertEquals(33.5731, updated.getLatitude());
        assertEquals(-7.5898, updated.getLongitude());
        assertEquals(false, updated.isAvailable());
        assertEquals("0612345678", updated.getPhone());
    }

    @Test
    void missingDonorThrowsEntityNotFound() {
        when(donorRepository.findByUserEmail("missing@test.com"))
                .thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> donorService.getDonorForUser("missing@test.com"));
    }

    @Test
    void getProfileReturnsKnownDonor() {
        Donor donor = new Donor();
        donor.setFullName("Known Donor");
        when(donorRepository.findByUserEmail("donor@test.com"))
                .thenReturn(Optional.of(donor));

        Donor profile = donorService.getProfile("donor@test.com");

        assertEquals("Known Donor", profile.getFullName());
        verify(donorRepository).findByUserEmail("donor@test.com");
    }

    @Test
    void getProfileThrowsForUnknownDonor() {
        when(donorRepository.findByUserEmail("unknown@test.com"))
                .thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> donorService.getProfile("unknown@test.com"));

        assertEquals("Donor not found", exception.getMessage());
    }

    @Test
    void getsOnlyNotifiedAlertsForDonor() {
        Donor donor = new Donor();
        DonorResponse response = new DonorResponse();
        when(donorRepository.findByUserEmail("donor@test.com"))
                .thenReturn(Optional.of(donor));
        when(donorResponseRepository.findByDonorUserEmailAndStatus(
                "donor@test.com", ResponseStatus.NOTIFIED))
                .thenReturn(List.of(response));

        List<DonorResponse> alerts = donorService.getNotifiedAlerts("donor@test.com");

        assertEquals(List.of(response), alerts);
        verify(donorRepository).findByUserEmail("donor@test.com");
        verify(donorResponseRepository).findByDonorUserEmailAndStatus(
                "donor@test.com", ResponseStatus.NOTIFIED);
    }
}
