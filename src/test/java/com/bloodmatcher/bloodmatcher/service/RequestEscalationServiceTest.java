package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import com.bloodmatcher.bloodmatcher.repository.BloodRequestRepository;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestEscalationServiceTest {

    @Mock private BloodRequestRepository bloodRequestRepository;
    @Mock private DonorResponseRepository donorResponseRepository;
    @Mock private MatchingService matchingService;

    private RequestEscalationService service;
    private BloodRequest request;
    private final LocalDateTime now = LocalDateTime.of(2026, 11, 18, 23, 30);

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-11-18T23:30:00Z"), ZoneOffset.UTC);
        service = new RequestEscalationService(
                bloodRequestRepository, donorResponseRepository, matchingService, clock);
        ReflectionTestUtils.setField(service, "criticalDelaySeconds", 600L);
        ReflectionTestUtils.setField(service, "urgentDelaySeconds", 1800L);
        ReflectionTestUtils.setField(service, "normalDelaySeconds", 7200L);
        request = new BloodRequest();
        request.setId(100L);
        request.setUnitsNeeded(2);
        request.setUrgency(Urgency.CRITICAL);
        request.setDeadline(now.plusHours(4));
        request.setLastEscalationAt(now.minusHours(3));
        when(bloodRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(request));
    }

    @Test
    void skipsDeletedRequest() {
        when(bloodRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.empty());
        service.processRequest(100L);
        verifyNoInteractions(donorResponseRepository, matchingService);
    }

    @ParameterizedTest
    @EnumSource(value = RequestStatus.class, names = {"FULFILLED", "CANCELLED", "EXPIRED"})
    void skipsClosedRequest(RequestStatus status) {
        request.setStatus(status);
        service.processRequest(100L);
        assertEquals(status, request.getStatus());
        verifyNoInteractions(donorResponseRepository, matchingService);
    }

    @ParameterizedTest
    @CsvSource({"0", "-1"})
    void expiresAtOrAfterDeadlineEvenWhenCapacityIsFullOrRadiusIsMax(int seconds) {
        request.setDeadline(now.plusSeconds(seconds));
        request.setCurrentRadiusKm(60);
        DonorResponse accepted = new DonorResponse();
        accepted.setStatus(ResponseStatus.ACCEPTED);
        when(donorResponseRepository.findByRequestIdAndStatus(100L, ResponseStatus.ACCEPTED))
                .thenReturn(List.of(accepted));
        service.processRequest(100L);
        assertEquals(RequestStatus.EXPIRED, request.getStatus());
        assertEquals(ResponseStatus.NO_SHOW, accepted.getStatus());
        verify(donorResponseRepository, never()).countByRequestIdAndStatusIn(anyLong(), anyCollection());
        verifyNoInteractions(matchingService);
    }

    @ParameterizedTest
    @CsvSource({"5,15", "15,30", "30,60"})
    void escalatesOneStepAndNotifies(int current, int next) {
        request.setCurrentRadiusKm(current);
        service.processRequest(100L);
        assertEquals(next, request.getCurrentRadiusKm());
        assertEquals(now, request.getLastEscalationAt());
        assertEquals(RequestStatus.OPEN, request.getStatus());
        verify(matchingService).notifyDonors(request);
    }

    @Test
    void stopsAtMaximumRadiusWithoutUpdatingTimestamp() {
        request.setCurrentRadiusKm(60);
        LocalDateTime previous = request.getLastEscalationAt();
        service.processRequest(100L);
        assertEquals(60, request.getCurrentRadiusKm());
        assertEquals(previous, request.getLastEscalationAt());
        verifyNoInteractions(matchingService);
    }

    @Test
    void countsAcceptedAndDonatedAsOccupiedPlaces() {
        when(donorResponseRepository.countByRequestIdAndStatusIn(
                100L, List.of(ResponseStatus.ACCEPTED, ResponseStatus.DONATED))).thenReturn(2L);
        service.processRequest(100L);
        assertEquals(5, request.getCurrentRadiusKm());
        assertEquals(RequestStatus.OPEN, request.getStatus());
        verifyNoInteractions(matchingService);
    }

    @Test
    void escalatesWhenSomePlacesRemainFree() {
        when(donorResponseRepository.countByRequestIdAndStatusIn(anyLong(), anyCollection()))
                .thenReturn(1L);
        service.processRequest(100L);
        verify(matchingService).notifyDonors(request);
    }

    @ParameterizedTest
    @CsvSource({"CRITICAL,600", "URGENT,1800", "NORMAL,7200"})
    void waitsUntilUrgencyDelayAndRunsExactlyAtBoundary(Urgency urgency, long delay) {
        request.setUrgency(urgency);
        request.setLastEscalationAt(now.minusSeconds(delay - 1));
        service.processRequest(100L);
        assertEquals(5, request.getCurrentRadiusKm());
        verifyNoInteractions(matchingService);
        request.setLastEscalationAt(now.minusSeconds(delay));
        service.processRequest(100L);
        assertEquals(15, request.getCurrentRadiusKm());
        verify(matchingService).notifyDonors(request);
    }

    @Test
    void supportsTwentySecondDemoDelay() {
        ReflectionTestUtils.setField(service, "criticalDelaySeconds", 20L);
        request.setLastEscalationAt(now.minusSeconds(20));
        service.processRequest(100L);
        verify(matchingService).notifyDonors(request);
    }

    @Test
    void repeatedScanDoesNotImmediatelyEscalateAgain() {
        service.processRequest(100L);
        service.processRequest(100L);
        assertEquals(15, request.getCurrentRadiusKm());
        verify(matchingService, times(1)).notifyDonors(request);
    }
}
