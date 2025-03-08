package prod.last.mainbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.PlaceType;
import prod.last.mainbackend.models.request.BookingTime;
import prod.last.mainbackend.models.request.PlaceCreate;
import prod.last.mainbackend.repositories.BookingRepository;
import prod.last.mainbackend.repositories.PlaceRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final BookingRepository bookingRepository;

    public List<PlaceModel> getFreePlacesByTypeAndCapacity(PlaceType type, Integer capacity, LocalDateTime start, LocalDateTime end) {
        return placeRepository.findFreePlacesByTypeAndCapacity(type, capacity != null ? capacity : 0, start, end);
    }

    public PlaceModel createPlace(PlaceType type, int capacity, String description, Long placeId, String name) {
        return placeRepository.save(new PlaceModel(capacity, description, type, placeId, name));
    }

    public PlaceModel getPlaceById(UUID id) {
        return placeRepository.findById(id).orElse(null);
    }

    public List<PlaceModel> getAllPlaces() {
        return placeRepository.findAll();
    }

    public List<PlaceModel> createPlaces(List<PlaceCreate> placeCreates) {
        List<PlaceModel> places = placeCreates.stream()
                .map(placeCreate -> new PlaceModel(
                        placeCreate.getCapacity(),
                        placeCreate.getDescription(),
                        placeCreate.getType(),
                        placeCreate.getPlaceId(),
                        placeCreate.getName()
                ))
                .collect(Collectors.toList());
        return placeRepository.saveAll(places);
    }

    public Optional<PlaceModel> getByName(String name) {
        return placeRepository.findByName(name);
    }

    public List<BookingTime> findBookingTimeByPlaceId(String name) {
        PlaceModel place = placeRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));
        List<BookingModel> bookings = bookingRepository.findAllByPlaceId(place.getId());

        return bookings.stream().map(booking -> {
            BookingTime bookingTime = new BookingTime();
            bookingTime.setStart(booking.getStartAt());
            bookingTime.setEnd(booking.getEndAt());
            return bookingTime;
        }).collect(Collectors.toList());
    }

}
