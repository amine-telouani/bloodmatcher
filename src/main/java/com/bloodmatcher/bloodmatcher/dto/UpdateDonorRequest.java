package com.bloodmatcher.bloodmatcher.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDonorRequest {

    @NotNull
    @DecimalMin("-90")
    @DecimalMax("90")
    private Double latitude;

    @NotNull
    @DecimalMin("-180")
    @DecimalMax("180")
    private Double longitude;

    @NotNull
    private Boolean available;

    @NotBlank
    private String phone;
}
