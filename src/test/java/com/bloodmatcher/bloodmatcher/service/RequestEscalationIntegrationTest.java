package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.entity.*;
import com.bloodmatcher.bloodmatcher.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = "app.escalation.enabled=false")
class RequestEscalationIntegrationTest {

    @Autowired private RequestEscalationService service;
    @Autowired private EntityManager entityManager;
    @Autowired private PlatformTransactionManager transactionManager;
    @MockitoBean private MatchingService matchingService;

    private Long requestId;
    private Long hospitalId;
    private final List<Long> userIds = new ArrayList<>();
    private final List<Long> donorIds = new ArrayList<>();

    @AfterEach
    void removeFixtures() {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            if (requestId != null) {
                entityManager.createQuery("DELETE FROM DonorResponse r WHERE r.request.id = :id")
                        .setParameter("id", requestId).executeUpdate();
                BloodRequest request = entityManager.find(BloodRequest.class, requestId);
                if (request != null) entityManager.remove(request);
                entityManager.flush();
            }
            for (Long id : donorIds) entityManager.remove(entityManager.find(Donor.class, id));
            if (hospitalId != null) entityManager.remove(entityManager.find(Hospital.class, hospitalId));
            entityManager.flush();
            for (Long id : userIds) entityManager.remove(entityManager.find(User.class, id));
        });
    }

    @Test
    void expirationPersistsAndChangesOnlyAcceptedResponses() {
        createRequest(true);
        Long accepted = addResponse(ResponseStatus.ACCEPTED);
        Long donated = addResponse(ResponseStatus.DONATED);
        Long notified = addResponse(ResponseStatus.NOTIFIED);

        service.processRequest(requestId);

        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            assertEquals(RequestStatus.EXPIRED, entityManager.find(BloodRequest.class, requestId).getStatus());
            assertEquals(ResponseStatus.NO_SHOW, entityManager.find(DonorResponse.class, accepted).getStatus());
            assertEquals(ResponseStatus.DONATED, entityManager.find(DonorResponse.class, donated).getStatus());
            assertEquals(ResponseStatus.NOTIFIED, entityManager.find(DonorResponse.class, notified).getStatus());
        });
        verifyNoInteractions(matchingService);
    }

    @Test
    void escalationPersistsRadiusAndTimestamp() {
        createRequest(false);
        LocalDateTime before = LocalDateTime.now();

        service.processRequest(requestId);

        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            BloodRequest request = entityManager.find(BloodRequest.class, requestId);
            assertEquals(15, request.getCurrentRadiusKm());
            // PostgreSQL stores microseconds; allow rounding of the captured boundary.
            assertFalse(request.getLastEscalationAt().isBefore(before.minusSeconds(1)));
            assertEquals(RequestStatus.OPEN, request.getStatus());
        });
        verify(matchingService).notifyDonors(any(BloodRequest.class));
    }

    @Test
    void notificationFailureRollsBackRadiusAndTimestamp() {
        createRequest(false);
        LocalDateTime previous = new TransactionTemplate(transactionManager).execute(status ->
                entityManager.find(BloodRequest.class, requestId).getLastEscalationAt());
        doThrow(new IllegalStateException("Simulated notification failure"))
                .when(matchingService).notifyDonors(any(BloodRequest.class));

        assertThrows(IllegalStateException.class, () -> service.processRequest(requestId));

        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            BloodRequest request = entityManager.find(BloodRequest.class, requestId);
            assertEquals(5, request.getCurrentRadiusKm());
            assertEquals(previous, request.getLastEscalationAt());
        });
    }

    private void createRequest(boolean expired) {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            Hospital hospital = new Hospital();
            hospital.setUser(newUser(Role.HOSPITAL));
            hospital.setName("Scheduler test hospital");
            hospital.setCity("Casablanca");
            entityManager.persist(hospital);
            hospitalId = hospital.getId();

            LocalDateTime now = LocalDateTime.now();
            BloodRequest request = new BloodRequest();
            request.setHospital(hospital);
            request.setBloodType(BloodType.A_POS);
            request.setUnitsNeeded(2);
            request.setUrgency(Urgency.CRITICAL);
            request.setCreatedAt(now.minusHours(3));
            request.setLastEscalationAt(now.minusHours(3));
            request.setDeadline(expired ? now.minusMinutes(1) : now.plusHours(2));
            entityManager.persist(request);
            requestId = request.getId();
        });
    }

    private Long addResponse(ResponseStatus responseStatus) {
        return new TransactionTemplate(transactionManager).execute(status -> {
            Donor donor = new Donor();
            donor.setUser(newUser(Role.DONOR));
            donor.setFullName("Scheduler test donor");
            donor.setBloodType(BloodType.A_POS);
            donor.setPhone("0600000000");
            entityManager.persist(donor);
            donorIds.add(donor.getId());

            DonorResponse response = new DonorResponse();
            response.setRequest(entityManager.find(BloodRequest.class, requestId));
            response.setDonor(donor);
            response.setStatus(responseStatus);
            entityManager.persist(response);
            return response.getId();
        });
    }

    private User newUser(Role role) {
        User user = new User();
        user.setEmail("scheduler-" + UUID.randomUUID() + "@test.local");
        user.setPasswordHash("unused-test-hash");
        user.setRole(role);
        entityManager.persist(user);
        userIds.add(user.getId());
        return user;
    }
}
