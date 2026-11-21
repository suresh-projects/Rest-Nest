package com.restnest.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Startup la PostgreSQL constraints create pannum (Hibernate idha create panna mudiyaadhu).
 * 1) EXCLUDE USING gist: same property ku overlapping PENDING/CONFIRMED booking DB level la block.
 * 2) CHECK: end_at > start_at
 */
@Component
public class BookingConstraintInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BookingConstraintInitializer.class);

    private final JdbcTemplate jdbc;

    public BookingConstraintInitializer(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbc.execute("CREATE EXTENSION IF NOT EXISTS btree_gist");
            addIfMissing("no_overlapping_bookings",
                    "ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings "
                            + "EXCLUDE USING gist (property_id WITH =, tsrange(start_at, end_at) WITH &&) "
                            + "WHERE (status IN ('PENDING','CONFIRMED'))");
            addIfMissing("chk_booking_time",
                    "ALTER TABLE bookings ADD CONSTRAINT chk_booking_time CHECK (end_at > start_at)");
        } catch (Exception e) {
            log.error(">>> Booking DB constraints create aagala: {}. "
                    + "pgAdmin la 'restnest' DB la Query Tool open panni 'CREATE EXTENSION btree_gist;' run pannunga, apram app restart pannunga.",
                    e.getMessage());
        }
    }

    private void addIfMissing(String name, String ddl) {
        Integer n = jdbc.queryForObject("SELECT count(*) FROM pg_constraint WHERE conname = ?", Integer.class, name);
        if (n == null || n == 0) {
            jdbc.execute(ddl);
            log.info(">>> DB constraint created: {}", name);
        }
    }
}
