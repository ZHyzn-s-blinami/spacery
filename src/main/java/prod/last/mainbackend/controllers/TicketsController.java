package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import prod.last.mainbackend.models.TicketStatus;
import prod.last.mainbackend.models.TicketType;
import prod.last.mainbackend.models.TicketsModel;
import prod.last.mainbackend.models.request.TicketCreate;
import prod.last.mainbackend.services.TicketsService;

import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketsController {

    private final TicketsService ticketsService;

    @Operation(
            summary = "Create a new ticket",
            description = "Creates a new ticket with the provided details"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Ticket created successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TicketsModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @PostMapping("/create")
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketCreate request) {
        try {
            return ResponseEntity.ok(ticketsService.createTicket(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
            summary = "Get tickets by type",
            description = "Retrieves all tickets of the specified type"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Tickets retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TicketsModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Invalid ticket type",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @GetMapping("/{type}")
    public ResponseEntity<?> findAllByTicketType(@Valid @PathVariable TicketType type) {
        try {
            return ResponseEntity.ok(ticketsService.findAllByTicketType(type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
            summary = "Get all tickets",
            description = "Retrieves all tickets"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Tickets retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TicketsModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Error retrieving tickets",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @GetMapping("/all")
    public ResponseEntity<?> findAll() {
        try {
            return ResponseEntity.ok(ticketsService.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
            summary = "Get tickets by status",
            description = "Retrieves all tickets with the specified status"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Tickets retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TicketsModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Invalid ticket status",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @GetMapping("/{status}")
    public ResponseEntity<?> findAllByStatus(@Valid @PathVariable TicketStatus status) {
        try {
            return ResponseEntity.ok(ticketsService.findAllByStatus(status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
            summary = "Change ticket status",
            description = "Changes the status of the specified ticket"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Ticket status changed successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TicketsModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @PostMapping("/{ticketId}/status/{status}")
    public ResponseEntity<?> changeStatus(@Valid @PathVariable UUID ticketId, @Valid @PathVariable TicketStatus status) {
        try {
            return ResponseEntity.ok(ticketsService.changeStatus(ticketId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}