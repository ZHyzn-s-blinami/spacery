package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import prod.last.mainbackend.models.response.JwtResponse;

@RestController
@RequestMapping("/api")
public class PingController {

    @Operation(
            summary = "Не ну это просто пинг",
            description = "да, это прям просто пинг"
    )
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok("PROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOD");
    }

    @Operation(
            summary = "Эндпойнт для проверки авторизации",
            description = "Просто проверяет авторизации. Пример заголовка: `Authorization: Bearer YOUR_JWT_TOKEN`",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Успешный ответ",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "PONG"))
    )
    @ApiResponse(
            responseCode = "401",
            description = "Неавторизован",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\":\"Full authentication is required to access this resource\",\"status\":401}"))
    )
    @GetMapping("/pong")
    public ResponseEntity<?> pong() {
        return ResponseEntity.ok("PONG");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin-only")
    public ResponseEntity<?> adminOnlyEndpoint() {
        return ResponseEntity.ok("This is an admin-only endpoint");
    }
}
