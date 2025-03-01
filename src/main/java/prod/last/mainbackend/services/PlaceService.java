package prod.last.mainbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.PlaceType;
import prod.last.mainbackend.models.request.PlaceCreate;
import prod.last.mainbackend.repositories.PlaceRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;

    public List<PlaceModel> getFreePlacesByTypeAndCapacity(PlaceType type, int capacity, LocalDateTime start, LocalDateTime end) {
        return placeRepository.findFreePlacesByTypeAndCapacity(type, capacity, start, end);
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

}
