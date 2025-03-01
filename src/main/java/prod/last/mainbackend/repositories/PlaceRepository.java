package prod.last.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.PlaceType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PlaceRepository extends JpaRepository<PlaceModel, UUID> {

@Query("SELECT p FROM PlaceModel p WHERE (:type = 'DEFAULT' OR p.type = :type) AND " +
        "(:capacity = 0 OR p.capacity = :capacity) AND p.id NOT IN " +
        "(SELECT b.placeId FROM BookingModel b WHERE (b.startAt <= :end AND b.endAt >= :start AND b.status = 'OVERDUE') OR b.startAt <= :end AND b.endAt >= :start)")
List<PlaceModel> findFreePlacesByTypeAndCapacity(@Param("type") PlaceType type,
                                                 @Param("capacity") Integer capacity,
                                                 @Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end);

}
