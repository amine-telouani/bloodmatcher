package com.bloodmatcher.bloodmatcher.scheduler;

import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.repository.BloodRequestRepository;
import com.bloodmatcher.bloodmatcher.service.RequestEscalationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EscalationSchedulerTest {

    @Mock private BloodRequestRepository bloodRequestRepository;
    @Mock private RequestEscalationService requestEscalationService;
    @InjectMocks private EscalationScheduler scheduler;

    @Test
    void processesOpenRequests() {
        when(bloodRequestRepository.findIdsByStatus(RequestStatus.OPEN)).thenReturn(List.of(1L, 2L));
        scheduler.processOpenRequests();
        verify(requestEscalationService).processRequest(1L);
        verify(requestEscalationService).processRequest(2L);
    }

    @Test
    void continuesWithOtherRequestsAfterFailure() {
        when(bloodRequestRepository.findIdsByStatus(RequestStatus.OPEN)).thenReturn(List.of(1L, 2L));
        doThrow(new IllegalStateException("Simulated failure"))
                .when(requestEscalationService).processRequest(1L);
        scheduler.processOpenRequests();
        verify(requestEscalationService).processRequest(2L);
    }

    @Test
    void doesNothingWhenNoRequestsAreOpen() {
        when(bloodRequestRepository.findIdsByStatus(RequestStatus.OPEN)).thenReturn(List.of());
        scheduler.processOpenRequests();
        verifyNoInteractions(requestEscalationService);
    }
}
