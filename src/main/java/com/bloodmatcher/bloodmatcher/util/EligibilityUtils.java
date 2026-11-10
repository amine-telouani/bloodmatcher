package com.bloodmatcher.bloodmatcher.util;

import java.time.LocalDate;

public class EligibilityUtils {

    private EligibilityUtils() {
    }

    public static boolean isPastCooldown(LocalDate lastDonationDate, int cooldownDays, LocalDate today){
        if (lastDonationDate == null){
            return true;
        }
        LocalDate endDate = lastDonationDate.plusDays(cooldownDays);
        return !endDate.isAfter(today);
    }
}
