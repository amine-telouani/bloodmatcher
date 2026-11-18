package com.bloodmatcher.bloodmatcher.repository;

import com.bloodmatcher.bloodmatcher.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByUserEmail(String email);

}