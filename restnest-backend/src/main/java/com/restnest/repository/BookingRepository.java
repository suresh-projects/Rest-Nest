package com.restnest.repository;

import com.restnest.entity.Booking;
import com.restnest.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByGuestEmailOrderByStartAtDesc(String email);

    List<Booking> findByPropertyHostEmailOrderByStartAtDesc(String email);

    /** [start, end) range overlap: back-to-back bookings (12:00 end, 12:00 start) overlap illa. */
    @Query("select b from Booking b where b.property.id = :pid and b.status in :statuses "
            + "and b.startAt < :end and b.endAt > :start order by b.startAt")
    List<Booking> findOverlapping(@Param("pid") Long propertyId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end,
                                  @Param("statuses") Collection<BookingStatus> statuses);
}
