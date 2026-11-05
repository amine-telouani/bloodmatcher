package com.bloodmatcher.bloodmatcher.enums;

import com.bloodmatcher.bloodmatcher.BloodType;
import org.junit.jupiter.api.Test;

import static com.bloodmatcher.bloodmatcher.BloodType.O_NEG;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.EnumSet;
import java.util.Set;

public class BloodTypeTest {

    @Test
    void oNegOnlyReceivesFromONeg(){
        Set<BloodType> comp = O_NEG.compatibleDonors();
        assertEquals(EnumSet.of(O_NEG), comp);
    }

    @Test
    void abPosReceivesFromEveryone() {
        Set<BloodType> comp = BloodType.AB_POS.compatibleDonors();
        assertEquals(EnumSet.allOf(BloodType.class), comp);
    }

    @Test
    void aPosReceivesFromFourTypes() {
        Set<BloodType> comp = BloodType.A_POS.compatibleDonors();
        assertEquals(
                EnumSet.of(BloodType.O_NEG, BloodType.O_POS, BloodType.A_NEG, BloodType.A_POS),
                comp);
    }
}
