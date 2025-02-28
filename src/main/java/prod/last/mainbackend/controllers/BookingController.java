package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import prod.last.mainbackend.models.response.BookingCreateResponse;

@RestController
@RequestMapping("/api")
public class BookingController {

    @Operation(
            summary = "Создание бронирования",
            description = "Создает бронирование"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Успешное создание бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingCreateResponse.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при создании бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingCreateResponse.class))
    )
    @RequestMapping("/booking/create")
    private ResponseEntity<BookingCreateResponse> create() {
        return ResponseEntity.ok(new BookingCreateResponse());
    }
}
