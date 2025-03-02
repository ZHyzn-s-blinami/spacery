package prod.last.mainbackend.services;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.BookingStatus;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.response.BookingCreateResponse;
import prod.last.mainbackend.models.response.BookingWithUserResponse;
import prod.last.mainbackend.repositories.BookingRepository;
import prod.last.mainbackend.repositories.PlaceRepository;
import prod.last.mainbackend.repositories.UserRepository;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${security.random-secret}")
    private String SECRET_KEY;

    private static final long EXPIRATION_TIME_MS = 5 * 60 * 1000;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public BookingModel create(UUID userId, String name, LocalDateTime start, LocalDateTime end) {
        log.info("Creating booking for user {} and place {}", userId, name);
        PlaceModel place = placeRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        UserModel userModel = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
        String formattedStart = start.format(formatter);
        String formattedEnd = end.format(formatter);

        emailService.sendSimpleMessage(
                userModel.getEmail(),
                "Создание бронирования",
                "Ваше бронирование на место " + place.getName() + " успешно создано.\n" +
                        "Ваше время с " + formattedStart + " по " + formattedEnd
        );

        return bookingRepository.save(new BookingModel(userId, place.getId(), start, end));
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

            BookingModel booking = bookingRepository.findById(UUID.fromString(claimsJws.getBody().getSubject()))
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

            if (booking.getStatus() != BookingStatus.PENDING) {
                return false;
            }

            Date expiration = claimsJws.getBody().getExpiration();

            if (expiration.after(new Date())) {
                booking.updateStatus(BookingStatus.ACCEPTED);
                bookingRepository.save(booking);
                return true;
            }

            return false;
        } catch (JwtException e) {
            log.warn("Invalid booking token: {}", e.getMessage());
            return false;
        }
    }

    public List<BookingModel> findAllByUserId(UUID userId) {
        log.info("Getting bookings by userId: {}", userId);
        return bookingRepository.findAllByUserId(userId);
    }

    public List<BookingCreateResponse> findBookingByUserId(UUID userId) {
        log.info("Getting booking by userId: {}", userId);
        List<BookingModel> bookings = bookingRepository.findAllByUserId(userId);
        if (bookings == null || bookings.isEmpty()) {
            return Collections.emptyList();
        }
        return bookings.stream().map(booking -> {
            PlaceModel placeModel = placeRepository.findById(booking.getPlaceId()).orElse(null);
            BookingCreateResponse response = new BookingCreateResponse();
            response.setBookingId(booking.getId().toString());
            response.setPlace(placeModel);
            response.setStartAt(booking.getStartAt().toString());
            response.setEndAt(booking.getEndAt().toString());
            response.setStatus(booking.getStatus().name());
            response.setCreatedAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null);
            response.setUpdatedAt(booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : null);
            return response;
        }).collect(Collectors.toList());
    }

    public List<BookingWithUserResponse> findAllByPlaceId(String name) {
        log.info("Getting booking by placeId: {}", name);

        PlaceModel place = placeRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        List<BookingModel> bookings = bookingRepository.findAllByPlaceId(place.getId());
        if (bookings == null || bookings.isEmpty()) {
            return Collections.emptyList();
        }
        return bookings.stream().map(booking -> {
            UserModel userModel = userRepository.findById(booking.getUserId()).orElse(null);
            BookingWithUserResponse response = new BookingWithUserResponse();
            response.setBookingId(booking.getId().toString());
            response.setUser(userModel);
            response.setStartAt(booking.getStartAt().toString());
            response.setEndAt(booking.getEndAt().toString());
            response.setStatus(booking.getStatus().name());
            response.setCreatedAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null);
            response.setUpdatedAt(booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : null);
            return response;
        }).collect(Collectors.toList());
    }

    @Scheduled(fixedRate = 300000)
    @Async
    public void checkAndUpdateBookingStatus() {
        List<BookingModel> bookings = bookingRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        log.info("Checking booking status");
        for (BookingModel booking : bookings) {
            if (booking.getStatus() == BookingStatus.PENDING && booking.getStartAt().plusMinutes(5).isBefore(now)) {
                booking.updateStatus(BookingStatus.OVERDUE);
                bookingRepository.save(booking);
            } else if (booking.getStatus() == BookingStatus.PENDING
                    && booking.getStartAt().minusMinutes(15).isBefore(now)
                    && !booking.isSentNotification()) {
                UserModel user = userRepository.findById(booking.getUserId()).orElse(null);
                emailService.sendSimpleMessage(user.getEmail(), "Напоминание о бронировании",
                        "Ваше бронирование начнется через 15 минут");
                booking.setSentNotification(true);
                bookingRepository.save(booking);
                log.info("Sending email to user {}", user.getEmail());
            } else if (booking.getStatus() == BookingStatus.PENDING
                    && booking.getEndAt().minusMinutes(15).isBefore(now)
                    && !booking.isSentNotification()) {
                UserModel user = userRepository.findById(booking.getUserId()).orElse(null);
                emailService.sendSimpleMessage(user.getEmail(), "Напоминание о бронировании",
                        "Ваше бронирование закончится через 15 минут");
                booking.setSentNotification(true);
                bookingRepository.save(booking);
                log.info("Sending email to user {}", user.getEmail());
            }
        }
    }

}
