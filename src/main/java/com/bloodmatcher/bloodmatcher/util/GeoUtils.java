package com.bloodmatcher.bloodmatcher.util;

public class GeoUtils {
    private static final double EARTH_RADIUS_KM = 6371;

    private GeoUtils() {
    }
    public static double distanceKm(double lat1, double lon1, double lat2, double lon2){
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double a = Math.pow(Math.sin(dLat/2), 2) + Math.cos(lat1Rad) * Math.cos(lat1Rad) * Math.pow(Math.sin(dLon/2), 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public static boolean isWithinRadius(double lat1, double lon1, double lat2, double lon2, double radiusKm){
        return distanceKm(lat1, lon1, lat2, lon2) <= radiusKm;
    }
}
