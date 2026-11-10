package com.bloodmatcher.bloodmatcher.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeoUtilsTest {

    private static final double CASABLANCA_LAT = 33.5731;
    private static final double CASABLANCA_LON = -7.5898;
    private static final double RABAT_LAT = 34.0209;
    private static final double RABAT_LON = -6.8416;

    @Test
    void samePointZero(){
        double result = GeoUtils.distanceKm(CASABLANCA_LAT, CASABLANCA_LON, CASABLANCA_LAT, -CASABLANCA_LON);
        assertEquals(0, result, 0.001 );
    }

    @Test
    void casablanceToRabat(){
        double result = GeoUtils.distanceKm(CASABLANCA_LAT, CASABLANCA_LON, RABAT_LAT, -RABAT_LON);
        assertEquals(87, result, 2 );
    }

    @Test
    void exactlyOnRadiusIsIncluded(){
        boolean result = GeoUtils.isWithinRadius(CASABLANCA_LAT, CASABLANCA_LON, CASABLANCA_LAT, CASABLANCA_LON, 5);
        assertTrue(result);
    }
        @Test
    void casablancaToRabatIsOutsideFiveKm(){
        boolean result = GeoUtils.isWithinRadius(CASABLANCA_LAT, CASABLANCA_LON, RABAT_LAT, RABAT_LON, 5);
        assertTrue(result);
    }
        @Test
    void casablancaToRabatIsInsideHundredKm(){
        boolean result = GeoUtils.isWithinRadius(CASABLANCA_LAT, CASABLANCA_LON, RABAT_LAT, RABAT_LON, 100);
        assertTrue(result);
    }


}