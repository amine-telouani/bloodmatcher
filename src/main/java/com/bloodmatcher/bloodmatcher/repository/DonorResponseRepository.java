package com.bloodmatcher.bloodmatcher.repository;

import com.bloodmatcher.bloodmatcher.entity.DonorResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import java.util.List;
import java.util.Collection;

public interface DonorResponseRepository extends JpaRepository<DonorResponse, Long> {

    @Query("SELECT r.donor.id FROM DonorResponse r WHERE r.request.id = :requestId")
    List<Long> findDonorIdsByRequestId(@Param("requestId") Long requestId);

    List<DonorResponse> findByDonorUserEmailAndStatus(String email, ResponseStatus status);

    List<DonorResponse> findByRequestIdAndStatus(Long requestId, ResponseStatus status);

    long countByRequestIdAndStatusIn(Long requestId, Collection<ResponseStatus> statuses);

}