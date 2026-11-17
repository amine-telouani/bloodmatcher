package com.bloodmatcher.bloodmatcher.service;

import java.util.Comparator;
import java.util.List;
import java.util.OptionalInt;
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

    public static List<RankedCandidate> rank(List<RankedCandidate> candidates){
        Comparator<RankedCandidate> byPriority = Comparator.comparing(RankedCandidate::exactMatch)
                  .reversed()
                  .thenComparingDouble(RankedCandidate::distanceKm);

        return candidates.stream()
                         .sorted(byPriority)
                         .toList();
    }

    private static final List<Integer> RADIUS_STEPS = List.of(5, 15, 30, 60);

    public static OptionalInt nextRadius(int currentRadiusKm){

        return RADIUS_STEPS.stream()
                           .filter(step -> step > currentRadiusKm)
                           .mapToInt(Integer::intValue)
                           .findFirst();
    }
}
