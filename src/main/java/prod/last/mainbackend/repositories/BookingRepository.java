package prod.last.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.BookingStatus;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<BookingModel, UUID> {
    List<BookingModel> findAllByPlaceId(UUID placeId);

    List<BookingModel> findAllByUserId(UUID userId);

    List<BookingModel> findAllByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, BookingStatus status);
}
