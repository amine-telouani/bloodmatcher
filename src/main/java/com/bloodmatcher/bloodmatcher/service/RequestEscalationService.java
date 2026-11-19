package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import com.bloodmatcher.bloodmatcher.repository.BloodRequestRepository;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.OptionalInt;

@Service
@RequiredArgsConstructor
public class RequestEscalationService {

    private final BloodRequestRepository bloodRequestRepository;
    private final DonorResponseRepository donorResponseRepository;
    private final MatchingService matchingService;
    private final Clock clock;

    @Value("${app.escalation.critical-delay-seconds:600}")
    private long criticalDelaySeconds;

    @Value("${app.escalation.urgent-delay-seconds:1800}")
    private long urgentDelaySeconds;

    @Value("${app.escalation.normal-delay-seconds:7200}")
    private long normalDelaySeconds;

    @Transactional
    public void processRequest(Long requestId) {
        BloodRequest request = bloodRequestRepository.findByIdForUpdate(requestId).orElse(null);
        if (request == null || request.getStatus() != RequestStatus.OPEN) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(clock);
        if (!request.getDeadline().isAfter(now)) {
            for (DonorResponse response : donorResponseRepository
                    .findByRequestIdAndStatus(requestId, ResponseStatus.ACCEPTED)) {
                response.setStatus(ResponseStatus.NO_SHOW);
            }
            request.setStatus(RequestStatus.EXPIRED);
            return;
        }

        long occupied = donorResponseRepository.countByRequestIdAndStatusIn(
                requestId, List.of(ResponseStatus.ACCEPTED, ResponseStatus.DONATED));
        if (occupied >= request.getUnitsNeeded()) {
            return;
        }

        OptionalInt nextRadius = MatchingRules.nextRadius(request.getCurrentRadiusKm());
        if (nextRadius.isEmpty()) {
            return;
        }

        LocalDateTime nextEscalation = request.getLastEscalationAt()
                .plusSeconds(delaySeconds(request.getUrgency()));
        if (now.isBefore(nextEscalation)) {
            return;
        }

        request.setCurrentRadiusKm(nextRadius.getAsInt());
        request.setLastEscalationAt(now);
        matchingService.notifyDonors(request);
    }

    private long delaySeconds(Urgency urgency) {
        return switch (urgency) {
            case CRITICAL -> criticalDelaySeconds;
            case URGENT -> urgentDelaySeconds;
            case NORMAL -> normalDelaySeconds;
        };
    }
}
