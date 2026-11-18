package com.bloodmatcher.bloodmatcher.dto;

import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class RequestResponse {

    private Long id;
    private BloodType bloodType;
    private int unitsNeeded;
    private Urgency urgency;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime deadline;
    private int currentRadiusKm;

    public static RequestResponse from(BloodRequest request) {
        return new RequestResponse(
                request.getId(),
                request.getBloodType(),
                request.getUnitsNeeded(),
                request.getUrgency(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getDeadline(),
                request.getCurrentRadiusKm()

        );
    }

}
