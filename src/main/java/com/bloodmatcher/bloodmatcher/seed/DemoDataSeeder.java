package com.bloodmatcher.bloodmatcher.seed;

import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.entity.User;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.Role;
import com.bloodmatcher.bloodmatcher.repository.DonorRepository;
import com.bloodmatcher.bloodmatcher.repository.HospitalRepository;
import com.bloodmatcher.bloodmatcher.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;

@Component
@Profile("demo")
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    @Value("${SEED_PASSWORD:}")
    private String seedPassword;

    @Value("${app.seed.email-domain:bloodmatcher.test}")
    private String emailDomain;

    @Override
    @Transactional
    public void run(String... args) {
        if (seedPassword == null || seedPassword.isBlank() || seedPassword.length() < 8) {
            throw new IllegalStateException("Set SEED_PASSWORD to a shared demo password of at least 8 characters");
        }

        getOrCreateUser("admin@" + emailDomain, Role.ADMIN);
        Hospital hospital = getOrCreateHospital();

        createDonor(1, BloodType.A_POS, 0.5, null, true, hospital);
        createDonor(2, BloodType.O_NEG, 1, 120, true, hospital);
        createDonor(3, BloodType.A_POS, 1.5, 7, true, hospital);
        createDonor(4, BloodType.B_POS, 2, null, true, hospital);
        createDonor(5, BloodType.O_POS, 3, null, true, hospital);
        createDonor(6, BloodType.A_NEG, 4, 120, true, hospital);
        createDonor(7, BloodType.A_POS, 7, null, true, hospital);
        createDonor(8, BloodType.O_NEG, 10, 120, true, hospital);
        createDonor(9, BloodType.AB_POS, 11, 14, true, hospital);
        createDonor(10, BloodType.B_NEG, 13, null, true, hospital);
        createDonor(11, BloodType.A_POS, 20, 120, true, hospital);
        createDonor(12, BloodType.AB_NEG, 25, null, true, hospital);
        createDonor(13, BloodType.O_NEG, 40, 120, true, hospital);
        createDonor(14, BloodType.A_POS, 70, null, true, hospital);
        createDonor(15, BloodType.A_POS, 1, null, false, hospital);

        log.info("Demo seed data is ready");
    }

    private User getOrCreateUser(String email, Role role) {
        User existing = userRepository.findByEmail(email).orElse(null);
        if (existing != null) {
            if (existing.getRole() != role) {
                throw new IllegalStateException("Demo account has an unexpected role: " + email);
            }
            return existing;
        }

        User user = new User();
        user.setEmail(email);
        user.setRole(role);
        user.setEnabled(true);
        user.setPasswordHash(passwordEncoder.encode(seedPassword));
        return userRepository.save(user);
    }

    private Hospital getOrCreateHospital() {
        String email = "hospital@" + emailDomain;
        User user = getOrCreateUser(email, Role.HOSPITAL);
        return hospitalRepository.findByUserEmail(email).orElseGet(() -> {
            Hospital hospital = new Hospital();
            hospital.setUser(user);
            hospital.setName("BloodMatcher Demo Hospital");
            hospital.setCity("Casablanca");
            hospital.setLatitude(33.5731);
            hospital.setLongitude(-7.5898);
            hospital.setVerified(true);
            return hospitalRepository.save(hospital);
        });
    }

    private void createDonor(int number, BloodType bloodType, double distanceKm,
                             Integer daysSinceDonation, boolean available, Hospital hospital) {
        String email = String.format("donor%02d@%s", number, emailDomain);
        User user = getOrCreateUser(email, Role.DONOR);
        if (donorRepository.findByUserEmail(email).isPresent()) {
            return;
        }

        Donor donor = new Donor();
        donor.setUser(user);
        donor.setFullName(String.format("Demo Donor %02d", number));
        donor.setPhone(String.format("060000%04d", number));
        donor.setBloodType(bloodType);
        donor.setLatitude(hospital.getLatitude() + distanceKm / 111.2);
        donor.setLongitude(hospital.getLongitude());
        donor.setAvailable(available);
        donor.setLastDonationDate(daysSinceDonation == null
                ? null : LocalDate.now(clock).minusDays(daysSinceDonation));
        donorRepository.save(donor);
    }
}
