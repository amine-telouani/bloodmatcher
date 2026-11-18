package com.bloodmatcher.bloodmatcher.dto;

import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class DonorAlertResponse {

    private Long responseId;
    private Long requestId;
    private BloodType bloodType;
    private int unitsNeeded;
    private Urgency urgency;
    private String hospitalName;
    private String hospitalCity;
    private LocalDateTime deadline;

    public static DonorAlertResponse from(DonorResponse response) {
        return new DonorAlertResponse(
                response.getId(),
                response.getRequest().getId(),
                response.getRequest().getBloodType(),
                response.getRequest().getUnitsNeeded(),
                response.getRequest().getUrgency(),
                response.getRequest().getHospital().getName(),
                response.getRequest().getHospital().getCity(),
                response.getRequest().getDeadline()
        );
    }
}
