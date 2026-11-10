package com.bloodmatcher.bloodmatcher.service;

import java.util.List;
import java.util.Set;

public class MatchingRules {

    private MatchingRules() {
    }

    public static List<Long> removeAlreadyNotified(List<Long> candidateIds, Set<Long> notifiedIds){
        return
                candidateIds.stream()
                            .filter(id -> !notifiedIds.contains(id))
                            .toList();
    }
}
