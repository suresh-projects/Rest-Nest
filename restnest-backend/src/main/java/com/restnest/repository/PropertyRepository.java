package com.restnest.repository;

import com.restnest.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    List<Property> findByHostEmailOrderByCreatedAtDesc(String email);

    @Query("select distinct p.area from Property p where p.active = true order by p.area")
    List<String> findDistinctAreas();
}
