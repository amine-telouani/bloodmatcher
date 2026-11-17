package com.bloodmatcher.bloodmatcher.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class EligibilityUtilsTest {
    private static final int COOLDOWN_DAYS = 30;
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 10);

    @Test
    void neverDonatedIsEligible() {

        LocalDate lastDonation = null;
        boolean result = EligibilityUtils.isPastCooldown(lastDonation, COOLDOWN_DAYS, TODAY);
        assertTrue(result);

    }

    @Test
    void oneDayBeforeEndIsNotEligible() {

        LocalDate lastDonation = TODAY.minusDays(COOLDOWN_DAYS - 1);
        boolean result = EligibilityUtils.isPastCooldown(lastDonation, COOLDOWN_DAYS, TODAY);
        assertTrue(result);

    }

    @Test
    void exactlyOnEndDateIsEligible() {

        LocalDate lastDonation = TODAY.minusDays(COOLDOWN_DAYS);
        boolean result = EligibilityUtils.isPastCooldown(lastDonation, COOLDOWN_DAYS, TODAY);
        assertTrue(result);

    }

    @Test
    void oneDayAfterEndIsEligible() {

        LocalDate lastDonation = TODAY.minusDays(COOLDOWN_DAYS + 1);
        boolean result = EligibilityUtils.isPastCooldown(lastDonation, COOLDOWN_DAYS, TODAY);
        assertTrue(result);

    }
}