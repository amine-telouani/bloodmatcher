package com.bloodmatcher.bloodmatcher.dto;

import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DonorProfileResponse {

    private Long id;
    private String fullName;
    private BloodType bloodType;
    private double latitude;
    private double longitude;
    private boolean available;
    private String phone;
    private LocalDate lastDonationDate;

    public static DonorProfileResponse from(Donor donor) {
        return new DonorProfileResponse(
                donor.getId(),
                donor.getFullName(),
                donor.getBloodType(),
                donor.getLatitude(),
                donor.getLongitude(),
                donor.isAvailable(),
                donor.getPhone(),
                donor.getLastDonationDate()
        );
    }
}
