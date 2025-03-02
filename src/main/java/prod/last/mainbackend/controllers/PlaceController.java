package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.PlaceType;
import prod.last.mainbackend.models.request.PlaceCreate;
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
            description = "Возвращает список свободных мест по типу и вместимости"
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
            @PathParam("start") String start,
            @PathParam("end") String end
    ) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startTime = start != null ? LocalDateTime.parse(start, formatter) : LocalDateTime.now();
            LocalDateTime endTime = end != null ? LocalDateTime.parse(end, formatter) : LocalDateTime.now().plusHours(1);
            PlaceType placeType = type != null ? PlaceType.valueOf(type.toUpperCase()) : PlaceType.DEFAULT;
            Integer capacityParam = capacity != null  ? capacity : 0;

            return ResponseEntity.ok(placeService.getFreePlacesByTypeAndCapacity(placeType, capacityParam, startTime, endTime));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Создание нового места",
            description = "Создаёт новое место. Доступно только для администраторов"
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
            summary = "Получение информации о месте по ID",
            description = "Возвращает информацию о месте по его уникальному идентификатору"
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
    @GetMapping("/{uuid}")
    public ResponseEntity<?> getPlaceById(@PathVariable String uuid) {
        try {
            UUID id = UUID.fromString(uuid);

            return ResponseEntity.ok(placeService.getPlaceById(id));
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
            description = "Создаёт новые места. Доступно только для администраторов"
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
}