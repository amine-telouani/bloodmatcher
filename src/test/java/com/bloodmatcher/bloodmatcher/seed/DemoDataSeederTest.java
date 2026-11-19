package com.bloodmatcher.bloodmatcher.seed;

import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.entity.User;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.Role;
import com.bloodmatcher.bloodmatcher.repository.DonorRepository;
import com.bloodmatcher.bloodmatcher.repository.HospitalRepository;
import com.bloodmatcher.bloodmatcher.repository.UserRepository;
import com.bloodmatcher.bloodmatcher.util.GeoUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "app.escalation.enabled=false")
@Transactional
class DemoDataSeederTest {

    private static final String PASSWORD = "Test-only-Seed123!";

    @Autowired private UserRepository userRepository;
    @Autowired private DonorRepository donorRepository;
    @Autowired private HospitalRepository hospitalRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ApplicationContext context;

    private DemoDataSeeder seeder;
    private String domain;

    @BeforeEach
    void setUp() {
        domain = "seed-" + UUID.randomUUID() + ".test";
        Clock clock = Clock.fixed(Instant.parse("2026-11-18T23:30:00Z"), ZoneOffset.UTC);
        seeder = new DemoDataSeeder(userRepository, donorRepository,
                hospitalRepository, passwordEncoder, clock);
        ReflectionTestUtils.setField(seeder, "seedPassword", PASSWORD);
        ReflectionTestUtils.setField(seeder, "emailDomain", domain);
    }

    @Test
    void createsSeventeenAccountsWithEncodedPasswordsAndCorrectProfiles() {
        seeder.run();
        List<User> users = demoUsers();
        assertEquals(17, users.size());
        assertEquals(15, users.stream().filter(user -> user.getRole() == Role.DONOR).count());
        assertEquals(1, users.stream().filter(user -> user.getRole() == Role.ADMIN).count());
        assertEquals(1, users.stream().filter(user -> user.getRole() == Role.HOSPITAL).count());
        assertEquals(15, demoDonors().size());
        assertTrue(hospitalRepository.findByUserEmail("hospital@" + domain).orElseThrow().isVerified());
        for (User user : users) {
            assertTrue(user.isEnabled());
            assertNotEquals(PASSWORD, user.getPasswordHash());
            assertTrue(passwordEncoder.matches(PASSWORD, user.getPasswordHash()));
        }
    }

    @Test
    void createsVariedBloodTypesDistancesCooldownsAndAvailability() {
        seeder.run();
        List<Donor> donors = demoDonors();
        Hospital hospital = hospitalRepository.findByUserEmail("hospital@" + domain).orElseThrow();
        assertEquals(EnumSet.allOf(BloodType.class), donors.stream()
                .map(Donor::getBloodType).collect(Collectors.toSet()));
        List<Double> distances = donors.stream().map(donor -> GeoUtils.distanceKm(
                hospital.getLatitude(), hospital.getLongitude(), donor.getLatitude(), donor.getLongitude()))
                .toList();
        assertTrue(distances.stream().anyMatch(distance -> distance < 5));
        assertTrue(distances.stream().anyMatch(distance -> distance > 5 && distance < 15));
        assertTrue(distances.stream().anyMatch(distance -> distance > 15 && distance < 30));
        assertTrue(distances.stream().anyMatch(distance -> distance > 30 && distance < 60));
        assertTrue(distances.stream().anyMatch(distance -> distance > 60));
        assertFalse(donorRepository.findByUserEmail("donor15@" + domain).orElseThrow().isAvailable());
        assertEquals(LocalDate.of(2026, 11, 11), donorRepository
                .findByUserEmail("donor03@" + domain).orElseThrow().getLastDonationDate());
        assertNull(donorRepository.findByUserEmail("donor01@" + domain).orElseThrow().getLastDonationDate());
    }

    @Test
    void rerunningDoesNotDuplicateAccountsOrOverwriteChanges() {
        seeder.run();
        User admin = userRepository.findByEmail("admin@" + domain).orElseThrow();
        String originalHash = admin.getPasswordHash();
        Long originalId = admin.getId();
        Donor donor = donorRepository.findByUserEmail("donor01@" + domain).orElseThrow();
        donor.setAvailable(false);
        donor.setLastDonationDate(LocalDate.of(2026, 11, 18));
        Hospital hospital = hospitalRepository.findByUserEmail("hospital@" + domain).orElseThrow();
        hospital.setVerified(false);
        ReflectionTestUtils.setField(seeder, "seedPassword", "Another-test-password");

        seeder.run();

        assertEquals(17, demoUsers().size());
        assertEquals(15, demoDonors().size());
        User sameAdmin = userRepository.findByEmail("admin@" + domain).orElseThrow();
        assertEquals(originalId, sameAdmin.getId());
        assertEquals(originalHash, sameAdmin.getPasswordHash());
        assertFalse(donorRepository.findByUserEmail("donor01@" + domain).orElseThrow().isAvailable());
        assertEquals(LocalDate.of(2026, 11, 18), donorRepository
                .findByUserEmail("donor01@" + domain).orElseThrow().getLastDonationDate());
        assertFalse(hospitalRepository.findByUserEmail("hospital@" + domain).orElseThrow().isVerified());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "short"})
    void invalidPasswordFailsBeforeCreatingAccounts(String password) {
        ReflectionTestUtils.setField(seeder, "seedPassword", password);
        assertThrows(IllegalStateException.class, () -> seeder.run());
        assertTrue(demoUsers().isEmpty());
    }

    @Test
    void refusesToChangeTheRoleOfAnExistingAccount() {
        User user = new User();
        user.setEmail("admin@" + domain);
        user.setRole(Role.DONOR);
        user.setPasswordHash("existing-test-hash");
        userRepository.save(user);
        assertThrows(IllegalStateException.class, () -> seeder.run());
        assertEquals(Role.DONOR, userRepository.findByEmail("admin@" + domain).orElseThrow().getRole());
        assertEquals(1, demoUsers().size());
    }

    @Test
    void seederIsNotActiveOutsideDemoProfile() {
        assertTrue(context.getBeansOfType(DemoDataSeeder.class).isEmpty());
    }

    private List<User> demoUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getEmail().endsWith("@" + domain)).toList();
    }

    private List<Donor> demoDonors() {
        return donorRepository.findAll().stream()
                .filter(donor -> donor.getUser().getEmail().endsWith("@" + domain)).toList();
    }
}
