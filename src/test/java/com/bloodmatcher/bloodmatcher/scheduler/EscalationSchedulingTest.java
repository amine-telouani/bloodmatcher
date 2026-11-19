package com.bloodmatcher.bloodmatcher.scheduler;

import com.bloodmatcher.bloodmatcher.config.SchedulingConfig;
import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.repository.BloodRequestRepository;
import com.bloodmatcher.bloodmatcher.service.RequestEscalationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@SpringJUnitConfig(EscalationSchedulingTest.TestConfig.class)
@TestPropertySource(properties = {
        "app.escalation.enabled=true",
        "app.escalation.scan-delay-ms=20"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class EscalationSchedulingTest {

    @Autowired private CountDownLatch processed;
    @Autowired private RequestEscalationService service;

    @Test
    void springInvokesTheScheduledJob() throws InterruptedException {
        assertTrue(processed.await(3, TimeUnit.SECONDS));
        verify(service, atLeastOnce()).processRequest(1L);
    }

    @Configuration
    @Import({SchedulingConfig.class, EscalationScheduler.class})
    static class TestConfig {

        @Bean
        CountDownLatch processed() {
            return new CountDownLatch(1);
        }

        @Bean
        BloodRequestRepository bloodRequestRepository() {
            BloodRequestRepository repository = mock(BloodRequestRepository.class);
            when(repository.findIdsByStatus(RequestStatus.OPEN)).thenReturn(List.of(1L));
            return repository;
        }

        @Bean
        RequestEscalationService requestEscalationService(CountDownLatch processed) {
            RequestEscalationService service = mock(RequestEscalationService.class);
            doAnswer(invocation -> {
                processed.countDown();
                return null;
            }).when(service).processRequest(1L);
            return service;
        }
    }
}
