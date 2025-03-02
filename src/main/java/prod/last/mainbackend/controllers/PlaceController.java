package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.PlaceType;
import prod.last.mainbackend.models.request.BookingTime;
import prod.last.mainbackend.models.request.PlaceCreate;
import prod.last.mainbackend.models.response.BookingCreateResponse;
import prod.last.mainbackend.services.PlaceService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/place")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @Operation(
            summary = "Получение списка свободных мест",
            description = "Возвращает список свободных мест по типу и вместимости",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Список свободных мест успешно получен",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlaceModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при получении списка свободных мест"
    )
    @GetMapping("/free")
    public ResponseEntity<?> getFreePlacesByTypeAndCapacity(
            @PathParam("type") String type,
            @PathParam("capacity") Integer capacity,
            @PathParam("start") LocalDateTime start,
            @PathParam("end") LocalDateTime end
    ) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            PlaceType placeType = type != null ? PlaceType.valueOf(type.toUpperCase()) : PlaceType.DEFAULT;
            Integer capacityParam = capacity != null  ? capacity : 0;

            return ResponseEntity.ok(placeService.getFreePlacesByTypeAndCapacity(placeType, capacityParam, start, end));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Создание нового места",
            description = "Создаёт новое место. Доступно только для администраторов",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Место успешно создано",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlaceModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при создании места"
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<?> createPlace(@Valid @RequestBody PlaceCreate placeCreate) {
        try {
            return ResponseEntity.ok(placeService.createPlace(
                    placeCreate.getType(),
                    placeCreate.getCapacity(),
                    placeCreate.getDescription(),
                    placeCreate.getPlaceId(),
                    placeCreate.getName()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Получение информации о месте по name",
            description = "Возвращает информацию о месте по name",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Информация о месте успешно получена",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlaceModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при получении информации о месте"
    )
    @GetMapping("/{name}")
    public ResponseEntity<?> getPlaceById(@PathVariable String name) {
        try {
            return ResponseEntity.ok(placeService.getByName(name));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPlaces() {
        try {
            return ResponseEntity.ok(placeService.getAllPlaces());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Создание новых мест",
            description = "Создаёт новые места. Доступно только для администраторов",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Места успешно созданы",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlaceModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при создании мест"
    )
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-multiple")
    public ResponseEntity<?> createPlaces(@Valid @RequestBody List<PlaceCreate> placeCreates) {
        try {
            return ResponseEntity.ok(placeService.createPlaces(placeCreates));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Получение времени бронирования по имени места",
            description = "Возвращает время бронирования для указанного места по его имени",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Время бронирования успешно получено",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = BookingTime.class)))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при получении времени бронирования"
    )
    @GetMapping("/booking-time/{name}")
    public ResponseEntity<?> findBookingTimeByPlaceId(@PathVariable String name) {
        try {
            return ResponseEntity.ok(placeService.findBookingTimeByPlaceId(name));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

}