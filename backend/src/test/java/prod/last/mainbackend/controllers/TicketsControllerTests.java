package prod.last.mainbackend.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import prod.last.mainbackend.models.TicketStatus;
import prod.last.mainbackend.models.TicketType;
import prod.last.mainbackend.models.TicketsModel;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.request.TicketCreate;
import prod.last.mainbackend.services.TicketsService;
import prod.last.mainbackend.services.UserService;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class TicketsControllerTests {

    @Mock
    private TicketsService ticketsService;

    @Mock
    private UserService userService;

    @Mock
    private Principal principal;

    @InjectMocks
    private TicketsController ticketsController;

    private final UUID userId = UUID.randomUUID();
    private final UUID ticketId = UUID.randomUUID();
    private final String placeName = "Test Place";
    private final TicketType ticketType = TicketType.CLEANING;
    private final String description = "Test description";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(principal.getName()).thenReturn(userId.toString());
    }

    @Test
    void createTicket_Success() {
        
        TicketCreate ticketCreate = new TicketCreate();
        ticketCreate.setPlaceName(placeName);
        ticketCreate.setTicketType(ticketType);
        ticketCreate.setDescription(description);

        UserModel user = new UserModel();
        user.setId(userId);

        TicketsModel ticketModel = new TicketsModel();
        ticketModel.setId(ticketId);
        ticketModel.setUserId(userId);
        ticketModel.setTicketType(ticketType);
        ticketModel.setDescription(description);

        when(userService.getUserById(userId)).thenReturn(user);
        when(ticketsService.createTicket(ticketCreate, userId)).thenReturn(ticketModel);

        
        ResponseEntity<?> response = ticketsController.createTicket(ticketCreate, principal);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(ticketModel, response.getBody());
        verify(ticketsService).createTicket(ticketCreate, userId);
    }

    @Test
    void createTicket_Error() {
        
        TicketCreate ticketCreate = new TicketCreate();
        ticketCreate.setPlaceName(placeName);
        ticketCreate.setTicketType(ticketType);
        ticketCreate.setDescription(description);

        UserModel user = new UserModel();
        user.setId(userId);

        when(userService.getUserById(userId)).thenReturn(user);
        when(ticketsService.createTicket(ticketCreate, userId)).thenThrow(new RuntimeException("Error creating ticket"));

        
        ResponseEntity<?> response = ticketsController.createTicket(ticketCreate, principal);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error creating ticket", response.getBody());
    }

    @Test
    void findAllByTicketType_Success() {
        
        List<TicketsModel> tickets = Arrays.asList(new TicketsModel(), new TicketsModel());
        when(ticketsService.findAllByTicketType(ticketType)).thenReturn(tickets);

        
        ResponseEntity<?> response = ticketsController.findAllByTicketType(ticketType);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(tickets, response.getBody());
    }

    @Test
    void findAllByTicketType_Error() {
        
        when(ticketsService.findAllByTicketType(ticketType)).thenThrow(new RuntimeException("Error retrieving tickets"));

        
        ResponseEntity<?> response = ticketsController.findAllByTicketType(ticketType);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error retrieving tickets", response.getBody());
    }

    @Test
    void findAll_Success() {
        List<TicketsModel> tickets = Arrays.asList(new TicketsModel(), new TicketsModel());
        // Исправлено название метода сервиса
        when(ticketsService.findAllOderByUpdatedAtDesc()).thenReturn(tickets);

        ResponseEntity<?> response = ticketsController.findAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(tickets, response.getBody());
    }

    @Test
    void findAll_Error() {
        // Исправлено название метода сервиса
        when(ticketsService.findAllOderByUpdatedAtDesc()).thenThrow(new RuntimeException("Error retrieving all tickets"));

        ResponseEntity<?> response = ticketsController.findAll();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error retrieving all tickets", response.getBody());
    }

    @Test
    void findAllByStatus_Success() {
        
        TicketStatus status = TicketStatus.OPEN;
        List<TicketsModel> tickets = Arrays.asList(new TicketsModel(), new TicketsModel());
        when(ticketsService.findAllByStatus(status)).thenReturn(tickets);

        
        ResponseEntity<?> response = ticketsController.findAllByStatus(status);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(tickets, response.getBody());
    }

    @Test
    void findAllByStatus_Error() {
        
        TicketStatus status = TicketStatus.OPEN;
        when(ticketsService.findAllByStatus(status)).thenThrow(new RuntimeException("Error retrieving tickets by status"));

        
        ResponseEntity<?> response = ticketsController.findAllByStatus(status);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error retrieving tickets by status", response.getBody());
    }

    @Test
    void changeStatus_Success() {
        
        TicketStatus newStatus = TicketStatus.CLOSED;

        TicketsModel updatedTicket = new TicketsModel();
        updatedTicket.setId(ticketId);
        updatedTicket.setStatus(newStatus);

        when(ticketsService.changeStatus(ticketId, newStatus)).thenReturn(updatedTicket);

        
        ResponseEntity<?> response = ticketsController.changeStatus(ticketId, newStatus);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedTicket, response.getBody());
    }

    @Test
    void changeStatus_Error() {
        
        TicketStatus newStatus = TicketStatus.CLOSED;
        when(ticketsService.changeStatus(ticketId, newStatus)).thenThrow(new RuntimeException("Error changing ticket status"));

        
        ResponseEntity<?> response = ticketsController.changeStatus(ticketId, newStatus);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error changing ticket status", response.getBody());
    }

    @Test
    void findByPlaceId_Success() {
        List<TicketsModel> tickets = Arrays.asList(new TicketsModel(), new TicketsModel());
        // Исправлено название мет��да сервиса
        when(ticketsService.findAllByPlaceIdOrderByCreatedAtDesc(placeName)).thenReturn(tickets);

        ResponseEntity<?> response = ticketsController.findByPlaceId(placeName);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(tickets, response.getBody());
    }

    @Test
    void findByPlaceId_Error() {
        // Исправлено название метода сервиса
        when(ticketsService.findAllByPlaceIdOrderByCreatedAtDesc(placeName)).thenThrow(new RuntimeException("Error retrieving tickets by place"));

        ResponseEntity<?> response = ticketsController.findByPlaceId(placeName);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error retrieving tickets by place", response.getBody());
    }
}