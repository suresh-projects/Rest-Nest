package com.restnest.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "property_photos")
public class PropertyPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id")
    private Property property;

    @Column(nullable = false)
    private String fileName;

    public PropertyPhoto() {}

    public PropertyPhoto(Property property, String fileName) {
        this.property = property;
        this.fileName = fileName;
    }

    public Long getId() { return id; }
    public Property getProperty() { return property; }
    public String getFileName() { return fileName; }
}
