package prod.last.mainbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.PlaceType;
import prod.last.mainbackend.repositories.PlaceRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;

    public List<PlaceModel> getFreePlacesByTypeAndCapacity(PlaceType type, int capacity, LocalDateTime start, LocalDateTime end) {
        return placeRepository.findFreePlacesByTypeAndCapacity(type, capacity, start, end);
    }

    public PlaceModel createPlace(PlaceType type, int capacity, String description) {
        return placeRepository.save(new PlaceModel(capacity, description, type));
    }
}
