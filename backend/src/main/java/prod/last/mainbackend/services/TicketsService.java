package prod.last.mainbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.TicketStatus;
import prod.last.mainbackend.models.TicketType;
import prod.last.mainbackend.models.TicketsModel;
import prod.last.mainbackend.models.request.TicketCreate;
import prod.last.mainbackend.repositories.PlaceRepository;
import prod.last.mainbackend.repositories.TicketsRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketsService {

    private final TicketsRepository ticketsRepository;
    private final PlaceRepository placeRepository;

    public TicketsModel createTicket(TicketCreate create, UUID userId) {
        PlaceModel place = placeRepository.findByName(create.getPlaceName())
                .orElseThrow(() -> new IllegalArgumentException("Place with name " + create.getPlaceName() + " not found"));

        return ticketsRepository.save(new TicketsModel(
                userId,
                place.getId(),
                create.getTicketType(),
                create.getDescription(),
                create.getPlaceName().charAt(0),
                create.getPlaceName()
        ));
    }

    public List<TicketsModel> findAllByTicketType(TicketType type) {
        return ticketsRepository.findAllByTicketType(type);
    }

    public List<TicketsModel> findAll() {
        return ticketsRepository.findAll(org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    public List<TicketsModel> findAllByStatus(TicketStatus status) {
        return ticketsRepository.findAllByStatus(status);
    }

    public TicketsModel changeStatus(UUID ticketId, TicketStatus status) {
        TicketsModel ticket = ticketsRepository.findById(ticketId).orElse(null);
        if (ticket == null) {
            throw new IllegalArgumentException("Ticket with id " + ticketId + " not found");
        }
        ticket.setStatus(status);
        return ticketsRepository.save(ticket);
    }

    public List<TicketsModel> findByPlaceId(String name) {
        PlaceModel place = placeRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Place with name " + name + " not found"));
        return ticketsRepository.findAllByPlaceIdOrderByCreatedAtDesc(place.getId());
    }

    public List<TicketsModel> findAllOrderByCreatedAtDesc() {
        return ticketsRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<TicketsModel> findAllOderByUpdatedAtDesc() {
        return ticketsRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<TicketsModel> findAllByPlaceIdOrderByCreatedAtDesc(String name) {
        PlaceModel place = placeRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Place with name " + name + " not found"));
        return ticketsRepository.findAllByPlaceIdOrderByUpdatedAtDesc(place.getId());
    }
}
