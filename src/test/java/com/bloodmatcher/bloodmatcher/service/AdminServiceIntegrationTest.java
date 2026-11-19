package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.dto.AdminStatsResponse;
import com.bloodmatcher.bloodmatcher.entity.*;
import com.bloodmatcher.bloodmatcher.enums.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AdminServiceIntegrationTest {

    @Autowired private AdminService adminService;
    @Autowired private EntityManager entityManager;

    @Test
    void verificationPersistsAndCanBeRepeated() {
        Hospital hospital = newHospital();
        Long id = hospital.getId();
        adminService.verifyHospital(id);
        entityManager.flush();
        entityManager.clear();
        assertTrue(entityManager.find(Hospital.class, id).isVerified());

        adminService.verifyHospital(id);
        entityManager.flush();
        entityManager.clear();
        assertTrue(entityManager.find(Hospital.class, id).isVerified());
    }

    @Test
    void unknownHospitalIsRejected() {
        assertThrows(EntityNotFoundException.class, () -> adminService.verifyHospital(Long.MAX_VALUE));
    }

    @Test
    void statisticsCountConfirmedDonationsRatherThanAcceptances() {
        AdminStatsResponse before = adminService.getStats();
        Hospital hospital = newHospital();
        adminService.verifyHospital(hospital.getId());
        Donor donor = new Donor();
        donor.setUser(newUser(Role.DONOR));
        donor.setFullName("Admin statistics test donor");
        donor.setPhone("0600000000");
        donor.setBloodType(BloodType.A_POS);
        entityManager.persist(donor);

        BloodRequest open = newRequest(hospital, RequestStatus.OPEN);
        BloodRequest fulfilled = newRequest(hospital, RequestStatus.FULFILLED);
        newResponse(open, donor, ResponseStatus.ACCEPTED);
        newResponse(fulfilled, donor, ResponseStatus.DONATED);
        entityManager.flush();
        entityManager.clear();

        AdminStatsResponse after = adminService.getStats();
        assertEquals(before.getTotalDonors() + 1, after.getTotalDonors());
        assertEquals(before.getTotalHospitals() + 1, after.getTotalHospitals());
        assertEquals(before.getVerifiedHospitals() + 1, after.getVerifiedHospitals());
        assertEquals(before.getTotalRequests() + 2, after.getTotalRequests());
        assertEquals(before.getOpenRequests() + 1, after.getOpenRequests());
        assertEquals(before.getFulfilledRequests() + 1, after.getFulfilledRequests());
        assertEquals(before.getTotalDonations() + 1, after.getTotalDonations());
    }

    private Hospital newHospital() {
        Hospital hospital = new Hospital();
        hospital.setUser(newUser(Role.HOSPITAL));
        hospital.setName("Admin verification test hospital");
        hospital.setCity("Casablanca");
        entityManager.persist(hospital);
        return hospital;
    }

    private User newUser(Role role) {
        User user = new User();
        user.setEmail("admin-test-" + UUID.randomUUID() + "@test.local");
        user.setPasswordHash("unused-test-hash");
        user.setRole(role);
        entityManager.persist(user);
        return user;
    }

    private BloodRequest newRequest(Hospital hospital, RequestStatus status) {
        BloodRequest request = new BloodRequest();
        request.setHospital(hospital);
        request.setBloodType(BloodType.A_POS);
        request.setUnitsNeeded(1);
        request.setUrgency(Urgency.NORMAL);
        request.setDeadline(LocalDateTime.now().plusDays(1));
        request.setStatus(status);
        entityManager.persist(request);
        return request;
    }

    private void newResponse(BloodRequest request, Donor donor, ResponseStatus status) {
        DonorResponse response = new DonorResponse();
        response.setRequest(request);
        response.setDonor(donor);
        response.setStatus(status);
        entityManager.persist(response);
    }
}
