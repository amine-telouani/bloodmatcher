package com.bloodmatcher.bloodmatcher.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
public class NotificationListener {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDonorsMatched(DonorsMatchedEvent event) {
        for (Long donorId : event.getDonorIds()) {
            log.info("Blood request {}: donor {} notified", event.getRequestId(), donorId);
        }
    }
}
