package com.bloodmatcher.bloodmatcher;

import java.util.EnumSet;
import java.util.Set;

public enum BloodType {
    A_POS, A_NEG, B_POS, B_NEG, AB_POS, AB_NEG, O_POS, O_NEG;

    public Set<BloodType> compatibleDonors(){
        return switch (this){
            case O_NEG -> EnumSet.of(O_NEG);
            case O_POS -> EnumSet.of(O_NEG, O_POS);
            case A_NEG -> EnumSet.of(O_NEG, A_NEG);
            case A_POS -> EnumSet.of(O_NEG, O_POS, A_POS, A_NEG);
            case B_NEG -> EnumSet.of(O_NEG, B_NEG);
            case B_POS -> EnumSet.of(O_NEG, O_POS, B_POS, B_NEG);
            case AB_NEG -> EnumSet.of(O_NEG, A_NEG, B_NEG, AB_NEG);
            case AB_POS -> EnumSet.allOf(BloodType.class);
        };
    }
}

