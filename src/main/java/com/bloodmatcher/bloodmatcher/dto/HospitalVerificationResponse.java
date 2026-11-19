package com.bloodmatcher.bloodmatcher.dto;

import com.bloodmatcher.bloodmatcher.entity.Hospital;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class HospitalVerificationResponse {

    private Long id;
    private String name;
    private String city;
    private boolean verified;

    public static HospitalVerificationResponse from(Hospital hospital) {
        return new HospitalVerificationResponse(
                hospital.getId(), hospital.getName(), hospital.getCity(), hospital.isVerified());
    }
}
