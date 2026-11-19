package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.event.DonorsMatchedEvent;
import com.bloodmatcher.bloodmatcher.repository.DonorRepository;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private DonorRepository donorRepository;

    @Mock
    private DonorResponseRepository donorResponseRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private MatchingService matchingService;

    private BloodRequest request;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(matchingService, "cooldownDays", 90);

        Hospital hospital = new Hospital();
        hospital.setLatitude(33.5731);
        hospital.setLongitude(-7.5898);

        request = new BloodRequest();
        request.setId(100L);
        request.setHospital(hospital);
        request.setBloodType(BloodType.A_POS);
        request.setUnitsNeeded(1);
        request.setCurrentRadiusKm(5);
    }

    @Test
    void findCompatibleCandidatesUsesCompatibleBloodTypes() {
        matchingService.findCompatibleCandidates(request);

        verify(donorRepository).findCandidates(
                BloodType.A_POS.compatibleDonors()
        );
    }

    @Test
    void findEligibleNearbyRemovesDonorsStillInCooldown() {
        Donor eligible = donor(1L, BloodType.A_POS, 33.5740, -7.5890);
        Donor coolingDown = donor(2L, BloodType.A_POS, 33.5740, -7.5890);
        coolingDown.setLastDonationDate(LocalDate.now().minusDays(30));

        when(donorRepository.findCandidates(anyCollection()))
                .thenReturn(List.of(eligible, coolingDown));
        when(donorResponseRepository.findDonorIdsByRequestId(100L))
                .thenReturn(List.of());

        List<Donor> result = matchingService.findEligibleNearby(request);

        assertEquals(List.of(eligible), result);
    }

    @Test
    void findEligibleNearbyRemovesDonorsOutsideRadius() {
        Donor nearby = donor(1L, BloodType.A_POS, 33.5740, -7.5890);
        Donor farAway = donor(2L, BloodType.A_POS, 34.0209, -6.8416);

        when(donorRepository.findCandidates(anyCollection()))
                .thenReturn(List.of(nearby, farAway));
        when(donorResponseRepository.findDonorIdsByRequestId(100L))
                .thenReturn(List.of());

        List<Donor> result = matchingService.findEligibleNearby(request);

        assertEquals(List.of(nearby), result);
    }

    @Test
    void findEligibleNearbyRemovesAlreadyNotifiedDonors() {
        Donor newDonor = donor(1L, BloodType.A_POS, 33.5740, -7.5890);
        Donor alreadyNotified = donor(2L, BloodType.A_POS, 33.5740, -7.5890);

        when(donorRepository.findCandidates(anyCollection()))
                .thenReturn(List.of(newDonor, alreadyNotified));
        when(donorResponseRepository.findDonorIdsByRequestId(100L))
                .thenReturn(List.of(2L));

        List<Donor> result = matchingService.findEligibleNearby(request);

        assertEquals(List.of(newDonor), result);
    }

    @Test
    void selectDonorsToNotifyRanksExactMatchBeforeUniversalAndAppliesTopLimit() {
        Donor universal = donor(1L, BloodType.O_NEG, 33.5740, -7.5890);
        Donor exactNear = donor(2L, BloodType.A_POS, 33.5742, -7.5892);
        Donor exactFar = donor(3L, BloodType.A_POS, 33.5750, -7.5900);
        Donor exactFarther = donor(4L, BloodType.A_POS, 33.5760, -7.5910);

        when(donorRepository.findCandidates(anyCollection()))
                .thenReturn(List.of(universal, exactFarther, exactFar, exactNear));
        when(donorResponseRepository.findDonorIdsByRequestId(100L))
                .thenReturn(List.of());

        List<Donor> result = matchingService.selectDonorsToNotify(request);

        assertEquals(List.of(exactNear, exactFar, exactFarther), result);
    }

    @Test
    void notifyDonorsSavesOneNotifiedResponsePerSelectedDonor() {
        MatchingService spy = spy(matchingService);
        Donor first = donor(1L, BloodType.A_POS, 33.5740, -7.5890);
        Donor second = donor(2L, BloodType.O_NEG, 33.5742, -7.5892);

        doReturn(List.of(first, second)).when(spy).selectDonorsToNotify(request);
        when(donorResponseRepository.saveAll(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<DonorResponse> result = spy.notifyDonors(request);

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(response ->
                response.getRequest() == request
                        && response.getStatus() == ResponseStatus.NOTIFIED
                        && response.getNotifiedAt() != null));
        verify(donorResponseRepository).saveAll(any());
    }

    @Test
    void notifyDonorsPublishesEventWithRequestAndDonorIds() {
        MatchingService spy = spy(matchingService);
        Donor first = donor(1L, BloodType.A_POS, 33.5740, -7.5890);
        Donor second = donor(2L, BloodType.O_NEG, 33.5742, -7.5892);

        doReturn(List.of(first, second)).when(spy).selectDonorsToNotify(request);
        when(donorResponseRepository.saveAll(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        spy.notifyDonors(request);

        ArgumentCaptor<DonorsMatchedEvent> captor = ArgumentCaptor.forClass(DonorsMatchedEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        assertEquals(100L, captor.getValue().getRequestId());
        assertEquals(List.of(1L, 2L), captor.getValue().getDonorIds());
    }

    @Test
    void notifyDonorsDoesNotPublishEventWhenNobodyIsNotified() {
        MatchingService spy = spy(matchingService);
        doReturn(List.of()).when(spy).selectDonorsToNotify(request);
        when(donorResponseRepository.saveAll(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        spy.notifyDonors(request);

        verify(eventPublisher, never()).publishEvent(any());
    }

    private Donor donor(Long id, BloodType bloodType, double latitude, double longitude) {
        Donor donor = new Donor();
        donor.setId(id);
        donor.setBloodType(bloodType);
        donor.setLatitude(latitude);
        donor.setLongitude(longitude);
        return donor;
    }
}
