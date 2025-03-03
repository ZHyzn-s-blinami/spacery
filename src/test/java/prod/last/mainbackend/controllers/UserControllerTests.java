package prod.last.mainbackend.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import prod.last.mainbackend.configurations.jwt.JwtUtils;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.UserRole;
import prod.last.mainbackend.models.request.EditUser;
import prod.last.mainbackend.models.request.LoginRequest;
import prod.last.mainbackend.models.request.RegisterRequest;
import prod.last.mainbackend.models.response.JwtResponse;
import prod.last.mainbackend.services.EmailService;
import prod.last.mainbackend.services.TokenService;
import prod.last.mainbackend.services.UserService;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserControllerTests {

    @Mock
    private UserService userService;

    @Mock
    private TokenService tokenService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private EmailService emailService;

    @Mock
    private Authentication authentication;

    @Mock
    private Principal principal;

    @InjectMocks
    private UserController userController;

    private final UUID userId = UUID.randomUUID();
    private final String email = "test@example.com";
    private final String password = "password";
    private final String name = "Test User";
    private final String jwtToken = "test.jwt.token";
    private final String tokenUUID = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(principal.getName()).thenReturn(userId.toString());
    }

    @Test
    void register_Success() {
        
        RegisterRequest request = new RegisterRequest();
        request.setEmail(email);
        request.setPassword(password);
        request.setName(name);
        request.setRole(UserRole.ROLE_USER);

        UserModel user = new UserModel();
        user.setId(userId);
        user.setEmail(email);
        user.setName(name);
        user.setTokenUUID(UUID.fromString(tokenUUID));

        when(userService.createUser(email, password, name, UserRole.ROLE_USER)).thenReturn(user);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication, UUID.fromString(tokenUUID))).thenReturn(jwtToken);

        
        ResponseEntity<?> response = userController.register(request);

        
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertEquals(jwtToken, jwtResponse.getToken());
        verify(tokenService).updateTokenUUID(user);
    }

    @Test
    void login_Success() {
        
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);

        UserModel user = new UserModel();
        user.setId(userId);
        user.setEmail(email);
        user.setTokenUUID(UUID.fromString(tokenUUID));

        when(userService.getUserByEmail(email)).thenReturn(user);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication, UUID.fromString(tokenUUID))).thenReturn(jwtToken);

        
        ResponseEntity<?> response = userController.login(request);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertEquals(jwtToken, jwtResponse.getToken());
        verify(tokenService).updateTokenUUID(user);
    }

    @Test
    void login_UserNotFound() {
        
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);

        when(userService.getUserByEmail(email)).thenReturn(null);

        
        ResponseEntity<?> response = userController.login(request);

        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("User not found", response.getBody());
    }

    @Test
    void getUserById_Success() {
        
        UserModel user = new UserModel();
        user.setId(userId);
        user.setEmail(email);
        user.setName(name);

        when(userService.getUserById(userId)).thenReturn(user);

        
        ResponseEntity<?> response = userController.getUserById(principal);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(user, response.getBody());
    }

    @Test
    void getUserById_Error() {
        
        when(userService.getUserById(userId)).thenThrow(new RuntimeException("User not found"));

        
        ResponseEntity<?> response = userController.getUserById(principal);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error: User not found", response.getBody());
    }

    @Test
    void getAllUsers_Success() {
        
        List<UserModel> users = Arrays.asList(
                new UserModel(), new UserModel()
        );

        when(userService.getAllUsers()).thenReturn(users);

        
        ResponseEntity<?> response = userController.getAllUsers();

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(users, response.getBody());
    }

    @Test
    void sendVerificationEmail_Success() {
        
        doNothing().when(userService).sendVerificationEmail(userId);

        
        ResponseEntity<?> response = userController.sendVerificationEmail(principal);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Verification email sent", response.getBody());
    }

    @Test
    void confirmUser_Success() {
        
        String token = "verification-token";
        doNothing().when(userService).confirmUser(token);

        
        ResponseEntity<?> response = userController.confirmUser(token);

        
        assertEquals(HttpStatus.FOUND, response.getStatusCode());
        assertTrue(response.getHeaders().getLocation().toString()
                .contains("https://prod-team-5-qnkvbg7c.final.prodcontest.ru/profile"));
    }

    @Test
    void editUser_Success() {
        
        EditUser editUser = new EditUser();
        editUser.setName("Updated Name");
        editUser.setEmail("updated@example.com");
        editUser.setDescription("Updated description");
        editUser.setPassword("newPassword");

        doNothing().when(userService).editUser(userId, editUser.getName(),
                editUser.getDescription(), editUser.getEmail(), editUser.getPassword());

        
        ResponseEntity<?> response = userController.editUser(userId, editUser);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User edited", response.getBody());
    }

    @Test
    void blockUser_Success() {
        
        doNothing().when(userService).blockUser(userId);

        
        ResponseEntity<?> response = userController.blockUser(userId);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User blocked", response.getBody());
    }

    @Test
    void unblockUser_Success() {
        
        doNothing().when(userService).unblockUser(userId);

        
        ResponseEntity<?> response = userController.unblockUser(userId);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User unblocked", response.getBody());
    }

    @Test
    void deleteUser_Success() {
        
        doNothing().when(userService).deleteUser(userId);

        
        ResponseEntity<?> response = userController.deleteUser(userId);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User deleted", response.getBody());
    }
}