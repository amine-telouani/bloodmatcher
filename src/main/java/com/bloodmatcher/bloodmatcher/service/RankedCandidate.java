package com.bloodmatcher.bloodmatcher.service;

public record RankedCandidate(Long donorId, boolean exactMatch, double distanceKm) {

}
