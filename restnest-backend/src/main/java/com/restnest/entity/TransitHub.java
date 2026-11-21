package com.restnest.entity;

public enum TransitHub {
    NONE("None"),
    CHENNAI_CENTRAL("Chennai Central"),
    EGMORE("Egmore"),
    KOYAMBEDU_CMBT("Koyambedu CMBT"),
    KILAMBAKKAM_KCBT("Kilambakkam KCBT"),
    AIRPORT("Chennai Airport"),
    TAMBARAM("Tambaram"),
    GUINDY("Guindy"),
    MAMBALAM("Mambalam");

    private final String label;

    TransitHub(String label) { this.label = label; }

    public String getLabel() { return label; }
}
