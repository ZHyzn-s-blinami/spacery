package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import prod.last.mainbackend.configurations.jwt.JwtUtils;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.request.EditUser;
import prod.last.mainbackend.models.request.LoginRequest;
import prod.last.mainbackend.models.request.RegisterRequest;
import prod.last.mainbackend.models.response.JwtResponse;
import prod.last.mainbackend.services.EmailService;
import prod.last.mainbackend.services.TokenService;
import prod.last.mainbackend.services.UserService;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TokenService tokenService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @Operation(
            summary = "Регистрация нового пользователя",
            description = "Создаёт нового пользователя и возвращает JWT-токен"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Пользователь успешно создан",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = JwtResponse.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Некорректные данные запроса"
    )
    @PostMapping("/sign-up")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        UserModel userModel = userService.createUser(request.getEmail(), request.getPassword(), request.getName(), request.getRole());

        tokenService.updateTokenUUID(userModel);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        userModel.getId().toString(),
                        request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication, userModel.getTokenUUID());

        return ResponseEntity.status(HttpStatus.CREATED).body(new JwtResponse(jwt));
    }

    @Operation(
            summary = "Аутентификация пользователя",
            description = "Позволяет пользователю войти в систему и получить JWT-токен"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Успешный вход",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = JwtResponse.class))
    )
    @ApiResponse(
            responseCode = "401",
            description = "Неверные учетные данные или пользователь не найден",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"error\": \"User not found\"}"))
    )
    @PostMapping("/sign-in")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {

        UserModel user = userService.getUserByEmail(loginRequest.getEmail());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getId().toString(),
                        loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        tokenService.updateTokenUUID(user);

        String jwt = jwtUtils.generateJwtToken(authentication, user.getTokenUUID());

        return ResponseEntity.ok(new JwtResponse(jwt));
    }

    @Operation(
            summary = "Получение информации о текущем пользователе",
            description = "Возвращает информацию о текущем пользователе на основе его токена",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Информация о пользователе успешно получена",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при получении информации о пользователе"
    )
    @GetMapping("/me")
    public ResponseEntity<?> getUserById(Principal principal) {
        try {
            return ResponseEntity.ok(userService.getUserById(UUID.fromString(principal.getName())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Получение списка всех пользователей доступно только для администраторов",
            description = "Возвращает список всех пользователей. Доступно только для администраторов",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Список пользователей успешно получен",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserModel.class))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при получении списка пользователей"
    )
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Отправка верификационного email",
        description = "Отправляет верификационное письмо на email пользователя",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
        responseCode = "200",
        description = "Верификационное письмо успешно отправлено",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"Verification email sent\"}"))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Ошибка при отправке верификационного письма",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"error\": \"Error message\"}"))
    )
    @PostMapping("/verify")
    public ResponseEntity<?> sendVerificationEmail(Principal principal) {
        try {
            userService.sendVerificationEmail(UUID.fromString(principal.getName()));
            return ResponseEntity.ok("Verification email sent");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Подтверждение пользователя",
        description = "Подтверждает пользователя по токену",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
        responseCode = "302",
        description = "Пользователь успешно подтверждён",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"User confirmed\"}"))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Ошибка при подтверждении пользователя",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"error\": \"Error message\"}"))
    )
    @GetMapping("/confirm")
    public ResponseEntity<?> confirmUser(@RequestParam String token) {
        try {
            userService.confirmUser(token);
            return ResponseEntity.status(HttpStatus.FOUND).body("{\"message\": \"User confirmed\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
            summary = "Редактирование пользователя",
            description = "Редактирует информацию о пользователе. Доступно только для администраторов",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "Пользователь успешно отредактирован",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"User edited\"}"))
    )
    @ApiResponse(
            responseCode = "400",
            description = "Ошибка при редактировании пользователя",
            content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"error\": \"Error message\"}"))
    )
    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editUser(@PathVariable UUID id, @RequestBody EditUser editUser) {
        try {
            userService.editUser(id, editUser.getName(), editUser.getDescription(), editUser.getEmail(), editUser.getPassword());
            return ResponseEntity.ok("User edited");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Блокировка пользователя доступно только для администраторов",
        description = "Блокирует пользователя по его ID. Доступно только для администраторов",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
        responseCode = "200",
        description = "Пользователь успешно заблокирован",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"User blocked\"}"))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Ошибка при блокировке пользователя",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"error\": \"Error message\"}"))
    )
    @PostMapping("block/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> blockUser(@PathVariable UUID id) {
        try {
            userService.blockUser(id);
            return ResponseEntity.ok("User blocked");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Разблокировка пользователя доступно только для администраторов",
        description = "Разблокирует пользователя по его ID. Доступно только для администраторов",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
        responseCode = "200",
        description = "Пользователь успешно разблокирован",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"User unblocked\"}"))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Ошибка при разблокировке пользователя",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"error\": \"Error message\"}"))
    )
    @PostMapping("unblock/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unblockUser(@PathVariable UUID id) {
        try {
            userService.unblockUser(id);
            return ResponseEntity.ok("User unblocked");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Удаление пользователя доступно только для администраторов",
        description = "Удаляет пользователя по его ID. Доступно только для администраторов",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
        responseCode = "200",
        description = "Пользователь успешно удалён",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"User deleted\"}"))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Ошибка при удалении пользователя",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"error\": \"Error message\"}"))
    )
    @DeleteMapping("delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Подтверждение пользователя доступно только для администраторов",
        description = "Подтверждает пользователя по его ID. Доступно только для администраторов",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
        responseCode = "200",
        description = "Пользователь успешно подтверждён",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"message\": \"User verified\"}"))
    )
    @ApiResponse(
        responseCode = "400",
        description = "Ошибка при подтверждении пользователя",
        content = @Content(mediaType = "application/json", schema = @Schema(example = "{\"error\": \"Error message\"}"))
    )
    @PostMapping("/verify/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyUser(@PathVariable UUID id) {
        try {
            userService.verifyUser(id);
            return ResponseEntity.ok("User verified");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


}
