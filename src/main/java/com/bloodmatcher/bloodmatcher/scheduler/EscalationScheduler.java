package com.bloodmatcher.bloodmatcher.scheduler;

import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.repository.BloodRequestRepository;
import com.bloodmatcher.bloodmatcher.service.RequestEscalationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.escalation.enabled", havingValue = "true", matchIfMissing = true)
public class EscalationScheduler {

    private final BloodRequestRepository bloodRequestRepository;
    private final RequestEscalationService requestEscalationService;

    @Scheduled(
            fixedDelayString = "${app.escalation.scan-delay-ms:60000}",
            initialDelayString = "${app.escalation.scan-delay-ms:60000}"
    )
    public void processOpenRequests() {
        for (Long requestId : bloodRequestRepository.findIdsByStatus(RequestStatus.OPEN)) {
            try {
                requestEscalationService.processRequest(requestId);
            } catch (RuntimeException exception) {
                log.error("Could not process blood request {}", requestId, exception);
            }
        }
    }
}
