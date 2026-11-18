package com.bloodmatcher.bloodmatcher.repository;

import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonorResponseRepository
        extends JpaRepository<DonorResponse, Long> {
}