package com.restnest.entity;

public enum Amenity {
    AC("AC Room"),
    ATTACHED_BATHROOM("Attached Bathroom"),
    HOT_WATER("Hot Water"),
    WIFI("WiFi"),
    BED("Bed"),
    KIDS_FRIENDLY("Kids Friendly"),
    BABY_CARE_SPACE("Baby Feeding / Care Space"),
    PARKING("Parking"),
    TV("TV"),
    KITCHEN_ACCESS("Kitchen Access");

    private final String label;

    Amenity(String label) { this.label = label; }

    public String getLabel() { return label; }
}
