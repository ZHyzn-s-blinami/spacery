package prod.last.mainbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.TicketStatus;
import prod.last.mainbackend.models.TicketType;
import prod.last.mainbackend.models.TicketsModel;
import prod.last.mainbackend.repositories.TicketsRepository;
import prod.last.mainbackend.repositories.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketsService {
    private final TicketsRepository ticketsRepository;

    public TicketsModel createTicket(TicketsModel ticket) {
        return ticketsRepository.save(ticket);
    }

    public List<TicketsModel> findAllByTicketType(String ticketType) {
        return ticketsRepository.findAllByTicketType(TicketType.valueOf(ticketType));
    }

    public List<TicketsModel> findAll() {
        return ticketsRepository.findAll();
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
}
