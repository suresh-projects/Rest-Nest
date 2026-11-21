package com.restnest.service;

import com.restnest.dto.AvailabilityResponse;
import com.restnest.dto.BookingRequest;
import com.restnest.dto.BookingResponse;
import com.restnest.entity.Booking;
import com.restnest.entity.BookingStatus;
import com.restnest.entity.Property;
import com.restnest.entity.User;
import com.restnest.repository.BookingRepository;
import com.restnest.repository.PropertyRepository;
import com.restnest.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BookingService {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private static final List<BookingStatus> ACTIVE = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
    private static final int MAX_DAYS_AHEAD = 60;
    private static final int MIN_LEAD_MINUTES = 30;
    private static final int GUEST_CANCEL_CUTOFF_HOURS = 2;

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, PropertyRepository propertyRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    // ================= GUEST =================

    @Transactional
    public BookingResponse create(String guestEmail, BookingRequest r) {
        User guest = userRepository.findByEmail(guestEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Property p = propertyRepository.findById(r.propertyId())
                .filter(Property::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property kidaikala"));

        if (!Boolean.TRUE.equals(r.rulesAccepted())) {
            throw bad("House rules accept pannanum");
        }
        LocalTime st = r.startTime();
        if (st.getSecond() != 0 || st.getNano() != 0 || (st.getMinute() != 0 && st.getMinute() != 30)) {
            throw bad("Start time :00 illa :30 la irukkanum (example 10:00, 10:30)");
        }
        int hours = r.hours();
        if (hours < p.getMinHours()) {
            throw bad("Indha property ku minimum " + p.getMinHours() + " hour(s) book pannanum");
        }
        if (r.guests() > p.getMaxGuests()) {
            throw bad("Indha property ku maximum " + p.getMaxGuests() + " guests mattum");
        }

        LocalDateTime now = LocalDateTime.now(IST);
        LocalDateTime start = LocalDateTime.of(r.date(), st);
        LocalDateTime end = start.plusHours(hours);

        if (start.isBefore(now.plusMinutes(MIN_LEAD_MINUTES))) {
            throw bad("Start time ku kammiya " + MIN_LEAD_MINUTES + " minutes munnadiyaavadhu book pannanum");
        }
        if (r.date().isAfter(now.toLocalDate().plusDays(MAX_DAYS_AHEAD))) {
            throw bad("Maximum " + MAX_DAYS_AHEAD + " days munnadi mattum book pannalaam");
        }
        if (!end.toLocalDate().equals(r.date())
                || st.isBefore(p.getAvailableFrom())
                || end.toLocalTime().isAfter(p.getAvailableTo())) {
            throw bad("Slot host oda available time kulla irukkanum: "
                    + p.getAvailableFrom() + " - " + p.getAvailableTo());
        }

        if (!bookingRepository.findOverlapping(p.getId(), start, end, ACTIVE).isEmpty()) {
            throw slotTaken();
        }

        Booking b = new Booking();
        b.setProperty(p);
        b.setGuest(guest);
        b.setStartAt(start);
        b.setEndAt(end);
        b.setHours(hours);
        b.setGuestsCount(r.guests());
        b.setTotalAmount(p.getPricePerHour().multiply(BigDecimal.valueOf(hours)));
        b.setPurpose(r.purpose());
        b.setNote(r.note() == null ? null : r.note().trim());
        b.setRulesAccepted(true);
        b.setStatus(BookingStatus.PENDING);
        try {
            // Rendu per ore nerathula book panna, DB exclusion constraint thaduthuru.
            bookingRepository.saveAndFlush(b);
        } catch (DataIntegrityViolationException e) {
            throw slotTaken();
        }
        return toResponse(b, false);
    }

    public List<BookingResponse> listForGuest(String email) {
        return bookingRepository.findByGuestEmailOrderByStartAtDesc(email)
                .stream().map(b -> toResponse(b, false)).toList();
    }

    public BookingResponse getForGuest(Long id, String email) {
        return toResponse(findOwnedByGuest(id, email), false);
    }

    @Transactional
    public BookingResponse cancelByGuest(Long id, String email, String reason) {
        Booking b = findOwnedByGuest(id, email);
        if (b.getStatus() != BookingStatus.PENDING && b.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking already " + b.getStatus());
        }
        if (b.getStatus() == BookingStatus.CONFIRMED
                && LocalDateTime.now(IST).plusHours(GUEST_CANCEL_CUTOFF_HOURS).isAfter(b.getStartAt())) {
            throw bad("Confirmed booking ah start time ku " + GUEST_CANCEL_CUTOFF_HOURS
                    + " hours munnadi varai mattum cancel pannalaam");
        }
        b.setStatus(BookingStatus.CANCELLED);
        b.setStatusReason(clean(reason));
        return toResponse(b, false);
    }

    // ================= HOST =================

    public List<BookingResponse> listForHost(String email, BookingStatus status) {
        return bookingRepository.findByPropertyHostEmailOrderByStartAtDesc(email).stream()
                .filter(b -> status == null || b.getStatus() == status)
                .map(b -> toResponse(b, true)).toList();
    }

    public BookingResponse getForHost(Long id, String email) {
        return toResponse(findOwnedByHost(id, email), true);
    }

    @Transactional
    public BookingResponse confirm(Long id, String hostEmail) {
        Booking b = findOwnedByHost(id, hostEmail);
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking already " + b.getStatus());
        }
        if (b.getStartAt().isBefore(LocalDateTime.now(IST))) {
            throw bad("Slot time already pass aayiduchu");
        }
        b.setStatus(BookingStatus.CONFIRMED);
        return toResponse(b, true);
    }

    @Transactional
    public BookingResponse reject(Long id, String hostEmail, String reason) {
        Booking b = findOwnedByHost(id, hostEmail);
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking already " + b.getStatus());
        }
        b.setStatus(BookingStatus.REJECTED);
        b.setStatusReason(clean(reason));
        return toResponse(b, true);
    }

    @Transactional
    public BookingResponse cancelByHost(Long id, String hostEmail, String reason) {
        Booking b = findOwnedByHost(id, hostEmail);
        if (b.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Confirmed booking ah mattum cancel pannalaam. Pending ku reject use pannunga");
        }
        b.setStatus(BookingStatus.CANCELLED);
        b.setStatusReason(clean(reason));
        return toResponse(b, true);
    }

    // ================= PUBLIC =================

    public AvailabilityResponse availability(Long propertyId, LocalDate date) {
        Property p = propertyRepository.findById(propertyId)
                .filter(Property::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property kidaikala"));
        List<AvailabilityResponse.BookedSlot> slots = bookingRepository
                .findOverlapping(propertyId, date.atStartOfDay(), date.plusDays(1).atStartOfDay(), ACTIVE)
                .stream()
                .map(b -> new AvailabilityResponse.BookedSlot(b.getStartAt().toLocalTime(), b.getEndAt().toLocalTime()))
                .toList();
        return new AvailabilityResponse(date, p.getAvailableFrom(), p.getAvailableTo(), p.getMinHours(), slots);
    }

    // ================= helpers =================

    private Booking findOwnedByGuest(Long id, String email) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking kidaikala"));
        if (!b.getGuest().getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking kidaikala");
        }
        return b;
    }

    private Booking findOwnedByHost(Long id, String email) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking kidaikala"));
        if (!b.getProperty().getHost().getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Idhu unga property booking illa");
        }
        return b;
    }

    private BookingResponse toResponse(Booking b, boolean hostView) {
        Property p = b.getProperty();
        boolean confirmed = b.getStatus() == BookingStatus.CONFIRMED;
        return new BookingResponse(
                b.getId(), p.getId(), p.getTitle(), p.getArea(),
                (hostView || confirmed) ? p.getAddress() : null,
                b.getStartAt().toLocalDate(), b.getStartAt().toLocalTime(), b.getEndAt().toLocalTime(),
                b.getHours(), b.getGuestsCount(), b.getPurpose(), b.getNote(),
                b.getStatus(), b.getStatusReason(), b.getTotalAmount(),
                b.getGuest().getId(), b.getGuest().getFullName(),
                (hostView && confirmed) ? b.getGuest().getPhone() : null,
                p.getHost().getFullName(),
                (!hostView && confirmed) ? p.getHost().getPhone() : null,
                b.getCreatedAt());
    }

    private static String clean(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static ResponseStatusException bad(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }

    private static ResponseStatusException slotTaken() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Indha slot already book aayiduchu. Vera time select pannunga");
    }
}
