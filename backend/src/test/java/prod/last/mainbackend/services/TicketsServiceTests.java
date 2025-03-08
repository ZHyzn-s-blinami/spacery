package prod.last.mainbackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.TicketStatus;
import prod.last.mainbackend.models.TicketType;
import prod.last.mainbackend.models.TicketsModel;
import prod.last.mainbackend.models.request.TicketCreate;
import prod.last.mainbackend.repositories.PlaceRepository;
import prod.last.mainbackend.repositories.TicketsRepository;
import org.springframework.data.domain.Sort;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketsServiceTests {

    @Mock
    private TicketsRepository ticketsRepository;

    @Mock
    private PlaceRepository placeRepository;

    @InjectMocks
    private TicketsService ticketsService;

    private UUID userId;
    private UUID placeId;
    private UUID ticketId;
    private String placeName;
    private TicketsModel ticket;
    private PlaceModel place;
    private TicketCreate ticketCreate;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        placeId = UUID.randomUUID();
        ticketId = UUID.randomUUID();
        placeName = "Переговорная комната";

        place = new PlaceModel();
        place.setId(placeId);
        place.setName(placeName);

        ticket = new TicketsModel(
                userId,
                placeId,
                TicketType.TECHNICAL_PROBLEM,
                "Описание проблемы",
                'П',
                placeName
        );
        ticket.setId(ticketId);
        ticket.setStatus(TicketStatus.OPEN);

        ticketCreate = new TicketCreate();
        ticketCreate.setPlaceName(placeName);
        ticketCreate.setTicketType(TicketType.TECHNICAL_PROBLEM);
        ticketCreate.setDescription("Описание проблемы");
    }

    @Test
    void createTicket_Success() {
        
        when(placeRepository.findByName(placeName)).thenReturn(Optional.of(place));
        when(ticketsRepository.save(any(TicketsModel.class))).thenReturn(ticket);

        
        TicketsModel result = ticketsService.createTicket(ticketCreate, userId);

        
        assertNotNull(result);
        assertEquals(ticket.getId(), result.getId());
        assertEquals(userId, result.getUserId());
        assertEquals(placeId, result.getPlaceId());
        assertEquals(TicketType.TECHNICAL_PROBLEM, result.getTicketType());

        verify(placeRepository).findByName(placeName);
        verify(ticketsRepository).save(any(TicketsModel.class));
    }

    @Test
    void createTicket_PlaceNotFound() {
        
        when(placeRepository.findByName(placeName)).thenReturn(Optional.empty());

        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> ticketsService.createTicket(ticketCreate, userId));

        assertEquals("Place with name " + placeName + " not found", exception.getMessage());
        verify(placeRepository).findByName(placeName);
        verify(ticketsRepository, never()).save(any(TicketsModel.class));
    }

    @Test
    void findAllByTicketType_Success() {
        
        when(ticketsRepository.findAllByTicketType(TicketType.TECHNICAL_PROBLEM))
                .thenReturn(Collections.singletonList(ticket));

        
        List<TicketsModel> result = ticketsService.findAllByTicketType(TicketType.TECHNICAL_PROBLEM);

        
        assertEquals(1, result.size());
        assertEquals(ticket, result.get(0));
        verify(ticketsRepository).findAllByTicketType(TicketType.TECHNICAL_PROBLEM);
    }

    @Test
    void findAll_Success() {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");

        when(ticketsRepository.findAll(sort)).thenReturn(Collections.singletonList(ticket));

        List<TicketsModel> result = ticketsService.findAll();

        assertEquals(1, result.size());
        assertEquals(ticket, result.get(0));

        verify(ticketsRepository).findAll(sort);
    }

    @Test
    void findAllByStatus_Success() {
        
        when(ticketsRepository.findAllByStatus(TicketStatus.OPEN))
                .thenReturn(Collections.singletonList(ticket));

        
        List<TicketsModel> result = ticketsService.findAllByStatus(TicketStatus.OPEN);

        
        assertEquals(1, result.size());
        assertEquals(ticket, result.get(0));
        verify(ticketsRepository).findAllByStatus(TicketStatus.OPEN);
    }

    @Test
    void changeStatus_Success() {
        
        TicketsModel updatedTicket = new TicketsModel(
                userId,
                placeId,
                TicketType.TECHNICAL_PROBLEM,
                "Описание проблемы",
                'П',
                placeName
        );
        updatedTicket.setId(ticketId);
        updatedTicket.setStatus(TicketStatus.IN_PROGRESS);

        when(ticketsRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
        when(ticketsRepository.save(any(TicketsModel.class))).thenReturn(updatedTicket);

        
        TicketsModel result = ticketsService.changeStatus(ticketId, TicketStatus.IN_PROGRESS);

        
        assertNotNull(result);
        assertEquals(TicketStatus.IN_PROGRESS, result.getStatus());
        verify(ticketsRepository).findById(ticketId);
        verify(ticketsRepository).save(any(TicketsModel.class));
    }

    @Test
    void changeStatus_TicketNotFound() {
        
        when(ticketsRepository.findById(ticketId)).thenReturn(Optional.empty());

        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> ticketsService.changeStatus(ticketId, TicketStatus.IN_PROGRESS));

        assertEquals("Ticket with id " + ticketId + " not found", exception.getMessage());
        verify(ticketsRepository).findById(ticketId);
        verify(ticketsRepository, never()).save(any(TicketsModel.class));
    }

    @Test
    void findByPlaceId_Success() {
        
        when(placeRepository.findByName(placeName)).thenReturn(Optional.of(place));
        when(ticketsRepository.findAllByPlaceIdOrderByCreatedAtDesc(placeId))
                .thenReturn(Collections.singletonList(ticket));

        
        List<TicketsModel> result = ticketsService.findByPlaceId(placeName);

        
        assertEquals(1, result.size());
        assertEquals(ticket, result.get(0));
        verify(placeRepository).findByName(placeName);
        verify(ticketsRepository).findAllByPlaceIdOrderByCreatedAtDesc(placeId);
    }

    @Test
    void findByPlaceId_PlaceNotFound() {
        
        when(placeRepository.findByName(placeName)).thenReturn(Optional.empty());

        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> ticketsService.findByPlaceId(placeName));

        assertEquals("Place with name " + placeName + " not found", exception.getMessage());
        verify(placeRepository).findByName(placeName);
        verify(ticketsRepository, never()).findAllByPlaceIdOrderByCreatedAtDesc(any());
    }

    @Test
    void findAllOrderByCreatedAtDesc_Success() {
        
        when(ticketsRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(Collections.singletonList(ticket));

        
        List<TicketsModel> result = ticketsService.findAllOrderByCreatedAtDesc();

        
        assertEquals(1, result.size());
        assertEquals(ticket, result.get(0));
        verify(ticketsRepository).findAllByOrderByCreatedAtDesc();
    }
}