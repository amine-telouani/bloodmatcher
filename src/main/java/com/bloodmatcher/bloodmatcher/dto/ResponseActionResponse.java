package com.bloodmatcher.bloodmatcher.dto;

import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ResponseActionResponse {

    private Long id;
    private Long requestId;
    private BloodType bloodType;
    private int unitsNeeded;
    private Urgency urgency;
    private ResponseStatus status;
    private String hospitalName;
    private String hospitalCity;
    private LocalDateTime deadline;
    private LocalDateTime respondedAt;
    private String donorPhone;

    public static ResponseActionResponse from(DonorResponse response) {
        boolean showPhone = response.getStatus() == ResponseStatus.ACCEPTED
                || response.getStatus() == ResponseStatus.DONATED;

        return new ResponseActionResponse(
                response.getId(),
                response.getRequest().getId(),
                response.getRequest().getBloodType(),
                response.getRequest().getUnitsNeeded(),
                response.getRequest().getUrgency(),
                response.getStatus(),
                response.getRequest().getHospital().getName(),
                response.getRequest().getHospital().getCity(),
                response.getRequest().getDeadline(),
                response.getRespondedAt(),
                showPhone ? response.getDonor().getPhone() : null
        );
    }
}
