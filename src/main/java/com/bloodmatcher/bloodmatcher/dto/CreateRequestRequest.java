package com.bloodmatcher.bloodmatcher.dto;

import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CreateRequestRequest {

    @NotNull
    private BloodType bloodType;

    @NotNull @Min(1)
    private int unitsNeeded;

    @NotNull
    private Urgency urgency;

}
