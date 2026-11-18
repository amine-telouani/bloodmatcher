package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.dto.AuthResponse;
import com.bloodmatcher.bloodmatcher.dto.LoginRequest;
import com.bloodmatcher.bloodmatcher.dto.RegisterDonorRequest;
import com.bloodmatcher.bloodmatcher.dto.RegisterHospitalRequest;
import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.entity.Hospital;
import com.bloodmatcher.bloodmatcher.entity.User;
import com.bloodmatcher.bloodmatcher.enums.Role;
import com.bloodmatcher.bloodmatcher.exception.EmailAlreadyUsedException;
import com.bloodmatcher.bloodmatcher.repository.DonorRepository;
import com.bloodmatcher.bloodmatcher.repository.HospitalRepository;
import com.bloodmatcher.bloodmatcher.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final PasswordEncoder passwordEncoder;
    private final HospitalRepository hospitalRepository;

    @Transactional
    public AuthResponse registerDonor(RegisterDonorRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyUsedException(request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.DONOR);
        userRepository.save(user);

        Donor donor = new Donor();
        donor.setUser(user);
        donor.setFullName(request.getFullName());
        donor.setPhone(request.getPhone());
        donor.setBloodType(request.getBloodType());
        donor.setLatitude(request.getLatitude());
        donor.setLongitude(request.getLongitude());
        donorRepository.save(donor);

        return new AuthResponse(request.getEmail(), Role.DONOR.name(), "Registration successful");
    }

    @Transactional
    public AuthResponse registerHospital(RegisterHospitalRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyUsedException(request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.HOSPITAL);
        userRepository.save(user);

        Hospital hospital = new Hospital();
        hospital.setUser(user);
        hospital.setName(request.getName());
        hospital.setCity(request.getCity());
        hospital.setLatitude(request.getLatitude());
        hospital.setLongitude(request.getLongitude());
        hospital.setVerified(false);
        hospitalRepository.save(hospital);

        return new AuthResponse(request.getEmail(), Role.HOSPITAL.name(), "Registration successful. Your account must be verified by an admin.");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())){
            throw new BadCredentialsException("Invalid email or password");
        }

        return new AuthResponse(user.getEmail(), user.getRole().name(), "Login successful");

    }

}
