package prod.last.mainbackend.services;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.BookingStatus;
import prod.last.mainbackend.repositories.BookingRepository;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    @Value("${security.random-secret}")
    private String SECRET_KEY;

    private static final long EXPIRATION_TIME_MS = 5 * 60 * 1000;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public BookingModel create(UUID userId, UUID placeId, LocalDateTime start, LocalDateTime end) {
        log.info("Creating booking for user {} and place {}", userId, placeId);
        return bookingRepository.save(new BookingModel(userId, placeId, start, end));
    }

    public BookingModel reject(UUID bookingId) {
        log.info("Rejecting booking {}", bookingId);
        BookingModel booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        booking.updateStatus(BookingStatus.REJECTED);
        return bookingRepository.save(booking);
    }

    public String generateBookingCode(UUID bookingId) {
        log.info("Generating booking code for booking {}", bookingId);

        return Jwts.builder()
                .setSubject(bookingId.toString())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateBookingCode(String token) {
        try {
            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);

            Date expiration = claimsJws.getBody().getExpiration();
            return expiration.after(new Date());
        } catch (JwtException e) {
            log.warn("Invalid booking token: {}", e.getMessage());
            return false;
        }
    }

    public List<BookingModel> findAllByUserId(UUID userId) {
        log.info("Getting bookings by userId: {}", userId);
        return bookingRepository.findAllByUserId(userId);
    }

    public List<BookingModel> findAllByPlaceId(UUID placeId) {
        log.info("Getting bookings by placeId: {}", placeId);
        return bookingRepository.findAllByPlaceId(placeId);
    }
}
