package prod.last.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import prod.last.mainbackend.models.TicketStatus;
import prod.last.mainbackend.models.TicketType;
import prod.last.mainbackend.models.TicketsModel;

import java.util.List;
import java.util.UUID;

public interface TicketsRepository extends JpaRepository<TicketsModel, UUID> {
    List<TicketsModel> findAllByTicketType(TicketType ticketType);

    List<TicketsModel> findAllByStatus(TicketStatus status);

    TicketsModel findByPlaceId(UUID placeId);

    List<TicketsModel> findAllByPlaceIdOrderByCreatedAtDesc(UUID id);

    List<TicketsModel> findAllByOrderByCreatedAtDesc();
}
