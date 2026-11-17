package com.bloodmatcher.bloodmatcher.dto;

import com.bloodmatcher.bloodmatcher.enums.BloodType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterDonorRequest {

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 8)
    private String password;

    @NotBlank
    private String fullName;

    @NotBlank
    private String phone;

    @NotNull
    private BloodType bloodType;

    @NotNull @DecimalMin("-90") @DecimalMax("90")
    private Double latitude;

    @NotNull @DecimalMin("-180") @DecimalMax("180")
    private Double longitude;

}
