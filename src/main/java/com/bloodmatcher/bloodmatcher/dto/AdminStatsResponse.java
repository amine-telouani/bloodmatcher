package com.bloodmatcher.bloodmatcher.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalDonors;
    private long totalHospitals;
    private long verifiedHospitals;
    private long totalRequests;
    private long openRequests;
    private long fulfilledRequests;
    private long totalDonations;
}
