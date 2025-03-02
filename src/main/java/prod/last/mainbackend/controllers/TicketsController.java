package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
import prod.last.mainbackend.models.response.BookingCreateResponse;
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

    @Operation(
            summary = "Создать тикет",
            description = "Создаёт тикет с указанными данными",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Тикет успешно создан",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TicketsModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при создании тикета",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @PostMapping("/create")
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketCreate ticketCreate, Principal principal) {
        try {
            UserModel user = userService.getUserById(UUID.fromString(principal.getName()));

            return ResponseEntity.ok(ticketsService.createTicket(ticketCreate, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
            summary = "Получить тикеты по типу",
            description = "Получает все тикеты с указанным типом",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Тикеты успешно получены",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TicketsModel.class)))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Неправильный тип тикета",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @GetMapping("/get/{type}")
    public ResponseEntity<?> findAllByTicketType(@Valid @PathVariable TicketType type) {
        try {
            return ResponseEntity.ok(ticketsService.findAllByTicketType(type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
            summary = "Получить информацию о тикетах",
            description = "Получает информацию о всех тикетах",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Tickets retrieved successfully",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TicketsModel.class)))
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
            summary = "Получить тикет по статусу",
            description = "Получает все тикеты с указанным статусом",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Тикеты успешно получены",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TicketsModel.class)))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Неправильный статус тикета",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @GetMapping("/getByStatus/{status}")
    public ResponseEntity<?> findAllByStatus(@Valid @PathVariable TicketStatus status) {
        try {
            return ResponseEntity.ok(ticketsService.findAllByStatus(status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
            summary = "Изменить статус тикета",
            description = "Изменяет статус тикета на указанный",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Статус тикета успешно изменён",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TicketsModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при изменении статуса тикета",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @PostMapping("/setStatus/{ticketId}/{status}")
    public ResponseEntity<?> changeStatus(@Valid @PathVariable UUID ticketId, @Valid @PathVariable TicketStatus status) {
        try {
            return ResponseEntity.ok(ticketsService.changeStatus(ticketId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
        summary = "Получить тикет по месту",
        description = "Получает тикет по указанному месту",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
        responseCode = "200",
        description = "Тикет успешно получен",
        content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TicketsModel.class)))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Ошибка при получении тикета",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @GetMapping("/getByPlace/{name}")
    public ResponseEntity<?> findByPlaceId(@Valid @PathVariable String name) {
        try {
            return ResponseEntity.ok(ticketsService.findByPlaceId(name));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}