package com.bloodmatcher.bloodmatcher.enums;

import org.junit.jupiter.api.Test;

import static com.bloodmatcher.bloodmatcher.enums.BloodType.O_NEG;
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

    @Test
    void oPosReceivesFromTwoTypes() {
        Set<BloodType> comp = BloodType.O_POS.compatibleDonors();
        assertEquals(EnumSet.of(BloodType.O_NEG, BloodType.O_POS), comp);
    }

    @Test
    void aNegReceivesFromTwoTypes() {
        Set<BloodType> comp = BloodType.A_NEG.compatibleDonors();
        assertEquals(EnumSet.of(BloodType.O_NEG, BloodType.A_NEG), comp);
    }

    @Test
    void bNegReceivesFromTwoTypes() {
        Set<BloodType> comp = BloodType.B_NEG.compatibleDonors();
        assertEquals(EnumSet.of(BloodType.O_NEG, BloodType.B_NEG), comp);
    }

    @Test
    void bPosReceivesFromFourTypes() {
        Set<BloodType> comp = BloodType.B_POS.compatibleDonors();
        assertEquals(
                EnumSet.of(BloodType.O_NEG, BloodType.O_POS, BloodType.B_NEG, BloodType.B_POS),
                comp);
    }

    @Test
    void abNegReceivesFromFourTypes() {
        Set<BloodType> comp = BloodType.AB_NEG.compatibleDonors();
        assertEquals(
                EnumSet.of(BloodType.O_NEG, BloodType.A_NEG, BloodType.B_NEG, BloodType.AB_NEG),
                comp);
    }

}
