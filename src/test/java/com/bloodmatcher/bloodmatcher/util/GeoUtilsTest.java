package com.bloodmatcher.bloodmatcher.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeoUtilsTest {

    @Test
    void samePointZero(){
        double result = GeoUtils.distanceKm(33.5731, -7.5898, 33.5731, -7.5898);
        assertEquals(0, result, 0.001 );
    }

    @Test
    void casablanceToRabat(){
        double result = GeoUtils.distanceKm(33.5731, -7.5898, 34.0209, -6.8416);
        assertEquals(87, result, 2 );
    }
}