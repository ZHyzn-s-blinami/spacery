package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import prod.last.mainbackend.models.TicketStatus;
import prod.last.mainbackend.models.TicketType;
import prod.last.mainbackend.models.TicketsModel;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.request.TicketCreate;
import prod.last.mainbackend.services.TicketsService;
import prod.last.mainbackend.services.UserService;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketsController {

    private final TicketsService ticketsService;
    private final UserService userService;

    @Operation(summary = "Создать новый тикет")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Тикет успешно создан",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TicketCreate.class)) }),
            @ApiResponse(responseCode = "400", description = "Неверный ввод",
                    content = @Content) })
    @PostMapping("/create")
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketCreate ticketCreate, Principal principal) {
        try {
            UserModel user = userService.getUserById(UUID.fromString(principal.getName()));

            return ResponseEntity.ok(ticketsService.createTicket(ticketCreate, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Найти все тикеты по типу")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Тикеты найдены",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TicketType.class)) }),
            @ApiResponse(responseCode = "400", description = "Неверный ввод",
                    content = @Content) })
    @GetMapping("/get/{type}")
    public ResponseEntity<?> findAllByTicketType(@Valid @PathVariable TicketType type) {
        try {
            return ResponseEntity.ok(ticketsService.findAllByTicketType(type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Найти все тикеты")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Тикеты найдены",
                    content = { @Content(mediaType = "application/json") }),
            @ApiResponse(responseCode = "400", description = "Неверный ввод",
                    content = @Content) })
    @GetMapping("/all")
    public ResponseEntity<?> findAll() {
        try {
            return ResponseEntity.ok(ticketsService.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Найти все тикеты по статусу")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Тикеты найдены",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TicketStatus.class)) }),
            @ApiResponse(responseCode = "400", description = "Неверный ввод",
                    content = @Content) })
    @GetMapping("/getByStatus/{status}")
    public ResponseEntity<?> findAllByStatus(@Valid @PathVariable TicketStatus status) {
        try {
            return ResponseEntity.ok(ticketsService.findAllByStatus(status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Изменить статус тикета")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Статус успешно изменен",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TicketStatus.class)) }),
            @ApiResponse(responseCode = "400", description = "Неверный ввод",
                    content = @Content) })
    @PostMapping("/setStatus/{ticketId}/{status}")
    public ResponseEntity<?> changeStatus(@Valid @PathVariable UUID ticketId, @Valid @PathVariable TicketStatus status) {
        try {
            return ResponseEntity.ok(ticketsService.changeStatus(ticketId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}