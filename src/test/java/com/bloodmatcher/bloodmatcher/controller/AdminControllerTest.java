package com.bloodmatcher.bloodmatcher.controller;

import com.bloodmatcher.bloodmatcher.config.SecurityConfig;
import com.bloodmatcher.bloodmatcher.dto.AdminStatsResponse;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.service.AdminService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private AdminService adminService;

    @Test
    void anonymousUsersCannotAccessEitherEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/stats")).andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/admin/hospitals/1/verify")).andExpect(status().isUnauthorized());
        verifyNoInteractions(adminService);
    }

    @ParameterizedTest
    @ValueSource(strings = {"DONOR", "HOSPITAL"})
    void nonAdminsCannotAccessEitherEndpoint(String role) throws Exception {
        mockMvc.perform(get("/api/admin/stats").with(user("member@test.local").roles(role)))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/admin/hospitals/1/verify").with(user("member@test.local").roles(role)))
                .andExpect(status().isForbidden());
        verifyNoInteractions(adminService);
    }

    @Test
    void adminCanVerifyHospitalWithoutReceivingAccountData() throws Exception {
        Hospital hospital = new Hospital();
        hospital.setId(1L);
        hospital.setName("Test hospital");
        hospital.setCity("Casablanca");
        hospital.setVerified(true);
        when(adminService.verifyHospital(1L)).thenReturn(hospital);

        mockMvc.perform(put("/api/admin/hospitals/1/verify").with(user("admin@test.local").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test hospital"))
                .andExpect(jsonPath("$.city").value("Casablanca"))
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.user").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void missingHospitalReturnsNotFound() throws Exception {
        when(adminService.verifyHospital(99L)).thenThrow(new EntityNotFoundException("Hospital not found"));
        mockMvc.perform(put("/api/admin/hospitals/99/verify").with(user("admin@test.local").roles("ADMIN")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Hospital not found"));
    }

    @Test
    void adminCanReadStatistics() throws Exception {
        when(adminService.getStats()).thenReturn(new AdminStatsResponse(15, 2, 1, 4, 2, 1, 3));
        mockMvc.perform(get("/api/admin/stats").with(user("admin@test.local").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDonors").value(15))
                .andExpect(jsonPath("$.totalHospitals").value(2))
                .andExpect(jsonPath("$.verifiedHospitals").value(1))
                .andExpect(jsonPath("$.totalRequests").value(4))
                .andExpect(jsonPath("$.openRequests").value(2))
                .andExpect(jsonPath("$.fulfilledRequests").value(1))
                .andExpect(jsonPath("$.totalDonations").value(3));
    }
}
