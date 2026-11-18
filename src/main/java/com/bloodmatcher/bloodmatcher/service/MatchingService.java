package com.bloodmatcher.bloodmatcher.service;

import com.bloodmatcher.bloodmatcher.entity.BloodRequest;
import com.bloodmatcher.bloodmatcher.entity.Donor;
import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.repository.DonorRepository;
import com.bloodmatcher.bloodmatcher.repository.DonorResponseRepository;
import com.bloodmatcher.bloodmatcher.util.EligibilityUtils;
import com.bloodmatcher.bloodmatcher.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final DonorRepository donorRepository;
    private final DonorResponseRepository donorResponseRepository;

    @Value("${app.donation.cooldown-days}")
    private int cooldownDays;

    public List<Donor> findCompatibleCandidates(BloodRequest request) {
        Collection<BloodType> types = request.getBloodType().compatibleDonors();
        return donorRepository.findCandidates(types);
    }

    @Transactional(readOnly = true)
    public List<Donor> findEligibleNearby(BloodRequest request) {
        double hospitalLat = request.getHospital().getLatitude();
        double hospitalLon = request.getHospital().getLongitude();
        LocalDate today = LocalDate.now();
        Set<Long> alreadyNotified = new HashSet<>(
                donorResponseRepository.findDonorIdsByRequestId(request.getId()));

        return findCompatibleCandidates(request).stream()
                .filter(d -> EligibilityUtils.isPastCooldown(d.getLastDonationDate(), cooldownDays, today))
                .filter(d -> GeoUtils.distanceKm(hospitalLat, hospitalLon,
                        d.getLatitude(), d.getLongitude()) <= request.getCurrentRadiusKm())
                .filter(d -> !alreadyNotified.contains(d.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Donor> selectDonorsToNotify(BloodRequest request) {
        double hospitalLat = request.getHospital().getLatitude();
        double hospitalLon = request.getHospital().getLongitude();
        BloodType needed = request.getBloodType();
        int limit = 3 * request.getUnitsNeeded();

        List<Donor> eligible = findEligibleNearby(request);
        Map<Long, Donor> donorsById = eligible.stream()
                .collect(Collectors.toMap(Donor::getId, d -> d));

        List<RankedCandidate> candidates = eligible.stream()
                .map(d -> new RankedCandidate(
                        d.getId(),
                        d.getBloodType() == needed,
                        GeoUtils.distanceKm(hospitalLat, hospitalLon, d.getLatitude(), d.getLongitude())))
                .toList();

        return MatchingRules.rank(candidates).stream()
                .limit(limit)
                .map(c -> donorsById.get(c.donorId()))
                .toList();
    }
}