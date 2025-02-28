package prod.last.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import prod.last.mainbackend.models.PlaceModel;

import java.util.UUID;

public interface PlaceRepository extends JpaRepository<PlaceModel, UUID> {
}
