package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
    @PostMapping("/booking/create")
    private ResponseEntity<BookingCreateResponse> create() {
        return ResponseEntity.ok(new BookingCreateResponse());
    }

    @Operation(
            summary = "Отмена бронирования",
            description = "Отменяет бронирование"
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
    @PostMapping("/booking/cancel")
    private ResponseEntity<?> cancel() {
        return ResponseEntity.ok("{\"status\": true}");
    }

    @Operation(
            summary = "Получение qr-кода бронирования",
            description = "Получает qr-код бронирования"
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
    @GetMapping("/booking/qr")
    private ResponseEntity<?> qr() {
        return ResponseEntity.ok("{\"qrCode\": \"code\"}");
    }

    @Operation(
            summary = "Проверка qr-кода бронирования",
            description = "Проверяет qr-код бронирования"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Успешная проверка qr-кода бронирования",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"status\": true}"))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Бронирование не найдено",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"status\": false}"))
    )
    @GetMapping("/booking/qr/check")
    private ResponseEntity<?> qrCheck() {
        return ResponseEntity.ok("{\"status\": true}");
    }
}
