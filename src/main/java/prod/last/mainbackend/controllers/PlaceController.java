package prod.last.mainbackend.controllers;

import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import prod.last.mainbackend.models.PlaceType;
import prod.last.mainbackend.models.request.PlaceCreate;
import prod.last.mainbackend.services.PlaceService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/place")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

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

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<?> createPlace(@Valid @RequestBody PlaceCreate placeCreate) {
        try {
            return ResponseEntity.ok(placeService.createPlace(placeCreate.getType(), placeCreate.getCapacity(), placeCreate.getDescription()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
