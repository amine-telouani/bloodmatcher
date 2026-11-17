package com.bloodmatcher.bloodmatcher.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class RegisterHospitalRequest {

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 8)
    private String password;

    @NotBlank
    private String name;

    @NotBlank
    private String city;

    @NotNull @DecimalMin("-90") @DecimalMax("90")
    private Double latitude;

    @NotNull @DecimalMin("-180") @DecimalMax("180")
    private Double longitude;

}
