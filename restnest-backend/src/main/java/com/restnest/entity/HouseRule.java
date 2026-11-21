package com.restnest.entity;

public enum HouseRule {
    NO_ALCOHOL("No Alcohol"),
    NO_SMOKING("No Smoking"),
    FAMILY_ONLY("Family Only"),
    NO_PETS("No Pets"),
    NO_LOUD_MUSIC("No Loud Music"),
    ID_REQUIRED("ID Proof Required");

    private final String label;

    HouseRule(String label) { this.label = label; }

    public String getLabel() { return label; }
}
