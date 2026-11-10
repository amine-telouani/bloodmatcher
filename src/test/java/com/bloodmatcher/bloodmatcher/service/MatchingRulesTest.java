package com.bloodmatcher.bloodmatcher.service;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class MatchingRulesTest {

    @Test
    void removeAlreadyNotified() {

        List<Long> result = MatchingRules.removeAlreadyNotified(
                List.of(1L, 2L, 3L, 4L),
                Set.of(2L, 4L)
        );

        assertEquals(List.of(1L, 3L), result);

    }
}