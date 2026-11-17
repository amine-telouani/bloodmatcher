package com.bloodmatcher.bloodmatcher.service;

import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class MatchingRulesTest {

    @Test
    void removesNotifiedDonors() {

        List<Long> result = MatchingRules.removeAlreadyNotified(
                List.of(1L, 2L, 3L, 4L),
                Set.of(2L, 4L)
        );

        assertEquals(List.of(1L, 3L), result);

    }

    @Test
    void keepsOrderOfCandidates() {

        List<Long> result = MatchingRules.removeAlreadyNotified(
                List.of(2L, 1L, 3L),
                Set.of()
        );

        assertEquals(List.of(2L, 1L, 3L), result);

    }

    @Test
    void allNotifiedGivesEmptyList() {

        List<Long> result = MatchingRules.removeAlreadyNotified(
                List.of(1L, 2L),
                Set.of(2L, 1L)
        );

        assertEquals(List.of(), result);

    }

    @Test
    void exactMatchRanksBeforeUniversalDonor(){

        RankedCandidate a = new RankedCandidate(1L, false, 1);
        RankedCandidate b = new RankedCandidate(2L, true, 20);

        List<RankedCandidate> result = MatchingRules.rank(List.of(a, b));
        assertEquals(List.of(b, a), result);
    }

    @Test
    void sameMatchTypeSortsByDistance(){

        RankedCandidate a = new RankedCandidate(1L, true, 20);
        RankedCandidate b = new RankedCandidate(2L, true, 1);

        List<RankedCandidate> result = MatchingRules.rank(List.of(a, b));
        assertEquals(List.of(b, a), result);
    }

    @Test
    void doesNotModifyInput(){

        RankedCandidate a = new RankedCandidate(1L, true, 20);
        RankedCandidate b = new RankedCandidate(2L, true, 1);

        List<RankedCandidate> originalList = new ArrayList<>(List.of(a, b));
        MatchingRules.rank(originalList);
        assertEquals(List.of(a, b), originalList);
    }

    @Test
    void fiveGoesToFifteen(){

        OptionalInt result = MatchingRules.nextRadius(5);
        assertEquals(OptionalInt.of(15), result);

    }

    @Test
    void sixtyStops(){

        OptionalInt result = MatchingRules.nextRadius(60);
        assertTrue(result.isEmpty());

    }

    @Test
    void inBetweenValueGoesToNextStep(){

        OptionalInt result = MatchingRules.nextRadius(10);
        assertEquals(OptionalInt.of(15), result);

    }


}