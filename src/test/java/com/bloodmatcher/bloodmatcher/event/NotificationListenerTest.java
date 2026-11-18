package com.bloodmatcher.bloodmatcher.event;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class NotificationListenerTest {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactions;
    private Logger logger;
    private Level previousLevel;
    private ListAppender<ILoggingEvent> logAppender;

    @BeforeEach
    void setUp() {
        transactions = new TransactionTemplate(transactionManager);
        logger = (Logger) LoggerFactory.getLogger(NotificationListener.class);
        previousLevel = logger.getLevel();
        logger.setLevel(Level.INFO);
        logAppender = new ListAppender<>();
        logAppender.start();
        logger.addAppender(logAppender);
    }

    @AfterEach
    void tearDown() {
        logger.detachAppender(logAppender);
        logAppender.stop();
        logger.setLevel(previousLevel);
    }

    @Test
    void logsEachDonorOnlyAfterCommit() {
        transactions.executeWithoutResult(status -> {
            eventPublisher.publishEvent(new DonorsMatchedEvent(100L, List.of(1L, 2L)));

            assertTrue(logAppender.list.isEmpty());
        });

        assertEquals(List.of(
                "Blood request 100: donor 1 notified",
                "Blood request 100: donor 2 notified"
        ), messages());
    }

    @Test
    void doesNotLogWhenTransactionRollsBack() {
        transactions.executeWithoutResult(status -> {
            eventPublisher.publishEvent(new DonorsMatchedEvent(100L, List.of(1L)));
            status.setRollbackOnly();
        });

        assertTrue(logAppender.list.isEmpty());
    }

    @Test
    void doesNotLogWithoutTransaction() {
        eventPublisher.publishEvent(new DonorsMatchedEvent(100L, List.of(1L)));

        assertTrue(logAppender.list.isEmpty());
    }

    @Test
    void doesNotLogForEmptyBatch() {
        transactions.executeWithoutResult(status ->
                eventPublisher.publishEvent(new DonorsMatchedEvent(100L, List.of())));

        assertTrue(logAppender.list.isEmpty());
    }

    @Test
    void keepsTheOriginalBatchUntilCommit() {
        List<Long> donorIds = new ArrayList<>(List.of(1L));
        DonorsMatchedEvent event = new DonorsMatchedEvent(100L, donorIds);

        transactions.executeWithoutResult(status -> {
            eventPublisher.publishEvent(event);
            donorIds.add(2L);

            assertThrows(UnsupportedOperationException.class,
                    () -> event.getDonorIds().add(3L));
        });

        assertEquals(List.of("Blood request 100: donor 1 notified"), messages());
    }

    private List<String> messages() {
        return logAppender.list.stream()
                .map(ILoggingEvent::getFormattedMessage)
                .toList();
    }
}
