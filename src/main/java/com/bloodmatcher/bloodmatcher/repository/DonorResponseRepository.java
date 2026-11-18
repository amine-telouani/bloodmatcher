package com.bloodmatcher.bloodmatcher.repository;

import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonorResponseRepository extends JpaRepository<DonorResponse, Long> {

    @Query("SELECT r.donor.id FROM DonorResponse r WHERE r.request.id = :requestId")
    List<Long> findDonorIdsByRequestId(@Param("requestId") Long requestId);

}