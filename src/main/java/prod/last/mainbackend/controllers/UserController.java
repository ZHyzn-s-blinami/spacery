package prod.last.mainbackend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import prod.last.mainbackend.configurations.jwt.JwtUtils;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.request.LoginRequest;
import prod.last.mainbackend.models.request.RegisterRequest;
import prod.last.mainbackend.models.response.JwtResponse;
import prod.last.mainbackend.services.TokenService;
import prod.last.mainbackend.services.UserService;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TokenService tokenService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

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

        UserModel userModel = userService.createUser(request.getEmail(), request.getPassword(), request.getRole());

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
}
