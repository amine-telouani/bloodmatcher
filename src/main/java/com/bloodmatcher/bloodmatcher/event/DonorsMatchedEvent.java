package com.bloodmatcher.bloodmatcher.event;

import lombok.Getter;

import java.util.List;
import java.util.Objects;

@Getter
public final class DonorsMatchedEvent {

    private final Long requestId;
    private final List<Long> donorIds;

    public DonorsMatchedEvent(Long requestId, List<Long> donorIds) {
        this.requestId = Objects.requireNonNull(requestId);
        this.donorIds = List.copyOf(donorIds);
    }
}
