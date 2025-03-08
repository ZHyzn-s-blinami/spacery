package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.BookingStatus;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.request.BookingRequest;
import prod.last.mainbackend.models.request.CheckQrRequest;
import prod.last.mainbackend.models.response.BookingCreateResponse;
import prod.last.mainbackend.models.response.BookingWithUserAndPlaceResponse;
import prod.last.mainbackend.models.response.BookingWithUserResponse;
import prod.last.mainbackend.services.BookingService;
import prod.last.mainbackend.services.UserService;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    @Operation(
            summary = "Создание бронирования",
            description = "Создает бронирование",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "201",
            description = "Успешное создание бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при создании бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"status\": false}"))
    )
    @PostMapping("/booking/create")
    public ResponseEntity<?> create(@Valid @RequestBody BookingRequest bookingRequest, Principal principal) {
        try{
            UserModel user = userService.getUserById(UUID.fromString(principal.getName()));

            return ResponseEntity.status(201).body(bookingService.create(
                    user.getId(),
                    bookingRequest.getName(),
                    bookingRequest.getStartAt(),
                    bookingRequest.getEndAt(),
                    user.getVerified()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Отмена бронирования",
            description = "Отменяет бронирование",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Успешная отмена бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"status\": true}"))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Бронирование не найдено",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"status\": false}"))
    )
    @PostMapping("/booking/{uuid}/cancel")
    public ResponseEntity<?> cancel(@PathVariable UUID uuid) {
        try {
            bookingService.reject(uuid);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("{\"status\": false}");
        }

        return ResponseEntity.ok("{\"status\": true}");
    }

    @Operation(
            summary = "Получение qr-кода бронирования",
            description = "Получает qr-код бронирования",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Успешное получение qr-кода бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"qrCode\": \"code\"}"))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Бронирование не найдено",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"qrCode\": \"\"}"))
    )
    @GetMapping("/booking/{uuid}/qr")
    public ResponseEntity<?> qr(@PathVariable UUID uuid) {
        try {
            Map<String, String> response = new HashMap<>();
            response.put("qrCode", bookingService.generateBookingCode(uuid));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Проверка qr-кода бронирования доступно только для администратора",
            description = "Проверяет qr-код бронирования",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Успешная проверка qr-кода бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingWithUserAndPlaceResponse.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Бронирование не найдено",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "Error message"))
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/booking/qr/check")
    public ResponseEntity<?> qrCheck(@Valid @RequestBody CheckQrRequest checkQrRequest) {
        try {
            return ResponseEntity.ok(bookingService.validateBookingCode(checkQrRequest.getQrCode()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Получение всех бронирований по месту доступно только для администратора",
            description = "Получает все бронирования",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Успешное получение всех бронирований",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = BookingWithUserResponse.class)))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Бронирования не найдены или любая другая ошибка. Смотреть на ошибку",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/booking/{name}/place")
    public ResponseEntity<?> getAllBookingByPlace(@PathVariable String name) {
        try {
            return ResponseEntity.ok(bookingService.findAllByPlaceId(name));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Получение всех бронирований пользователя",
            description = "Возвращает список всех бронирований текущего пользователя",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Список бронирований успешно получен",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = BookingCreateResponse.class)))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Бронирования не найдены",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @GetMapping("/booking/user")
    public ResponseEntity<?> getAllBookingByUserId(Principal principal) {
        try {
            UUID userId = UUID.fromString(principal.getName());

            return ResponseEntity.ok(bookingService.findBookingByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Обновление времени бронирования",
            description = "Обновляет время бронирования",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Успешное обновление времени бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при обновлении времени бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @PostMapping("/booking/{uuid}/update")
    public ResponseEntity<?> update(
            @Valid @PathVariable UUID uuid,
            @RequestParam LocalDateTime startAt,
            @RequestParam LocalDateTime endAt
    ) {
        try {
            return ResponseEntity.ok(bookingService.updateBookingTime(uuid, startAt, endAt));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Получение всех бронирований пользователя по статусу",
            description = "Возвращает список всех бронирований текущего пользователя с указанным статусом",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Список бронирований успешно получен",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = BookingCreateResponse.class)))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Бронирования не найдены",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"message\"}"))
    )
    @GetMapping("/booking/status/{status}")
    public ResponseEntity<?> getAllBookingByUserIdAndStatus(@Valid @PathVariable BookingStatus status, Principal principal) {
        try {
            return ResponseEntity.ok(bookingService.findAllUserBookingsByStatus(UUID.fromString(principal.getName()), status));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
