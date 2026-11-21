package com.restnest.entity;

public enum BookingStatus {
    PENDING,     // guest request panniruku, host decide pannala
    CONFIRMED,   // host accept pannitaaru
    REJECTED,    // host reject pannitaaru
    CANCELLED    // guest or host cancel pannitaanga
}
