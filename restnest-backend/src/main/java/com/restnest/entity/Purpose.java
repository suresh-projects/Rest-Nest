package com.restnest.entity;

public enum Purpose {
    TRAVEL_REST("Travel Rest / Fresh Up"),
    TRAIN_BUS_WAIT("Waiting for Train / Bus"),
    MEDICAL_VISIT("Medical Visit"),
    EVENT("Function / Event"),
    OTHER("Other");

    private final String label;

    Purpose(String label) { this.label = label; }

    public String getLabel() { return label; }
}
