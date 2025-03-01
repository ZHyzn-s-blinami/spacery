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
            @PathParam("capacity") int capacity,
            @PathParam("start") String start,
            @PathParam("end") String end
    ) {
        try {
            LocalDateTime startTime = LocalDateTime.parse(start);
            LocalDateTime endTime = LocalDateTime.parse(end);
            PlaceType placeType = PlaceType.valueOf(type.toUpperCase());

            return ResponseEntity.ok(placeService.getFreePlacesByTypeAndCapacity(placeType, capacity, startTime, endTime));
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
                    placeCreate.getRow(),
                    placeCreate.getColumn(),
                    placeCreate.getPlaceId()
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
}