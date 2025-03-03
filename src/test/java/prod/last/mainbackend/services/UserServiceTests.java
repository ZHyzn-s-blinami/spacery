package prod.last.mainbackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.UserRole;
import prod.last.mainbackend.repositories.UserRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    private final String email = "test@example.com";
    private final String password = "password";
    private final String name = "Test User";
    private final UserRole role = UserRole.ROLE_USER;
    private final UUID userId = UUID.randomUUID();
    private final String encodedPassword = "encodedPassword";
    private final String description = "Test description";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "domain", "localhost:8080");
    }

    @Test
    void createUser_Success() {
        
        when(userRepository.findByEmail(email)).thenReturn(null);
        when(passwordEncoder.encode(password)).thenReturn(encodedPassword);

        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        when(userRepository.save(any(UserModel.class))).thenReturn(userModel);

        
        UserModel result = userService.createUser(email, password, name, role);

        
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals(encodedPassword, result.getPassword());
        assertEquals(name, result.getName());
        assertEquals(role, result.getRole());

        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).encode(password);
        verify(userRepository).save(any(UserModel.class));
    }

    @Test
    void createUser_EmailAlreadyExists() {
        
        UserModel existingUser = new UserModel(email, encodedPassword, name, role);
        when(userRepository.findByEmail(email)).thenReturn(existingUser);

        
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(email, password, name, role)
        );

        assertEquals("User with email " + email + " already exists", exception.getMessage());
        verify(userRepository).findByEmail(email);
        verify(userRepository, never()).save(any(UserModel.class));
    }

    @Test
    void getUserByEmail_Success() {
        
        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        when(userRepository.findByEmail(email)).thenReturn(userModel);

        
        UserModel result = userService.getUserByEmail(email);

        
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(userRepository).findByEmail(email);
    }

    @Test
    void getUserById_Success() {
        
        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        userModel.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userModel));

        
        UserModel result = userService.getUserById(userId);

        
        assertNotNull(result);
        assertEquals(userId, result.getId());
        verify(userRepository).findById(userId);
    }

    @Test
    void getUserById_NotFound() {
        
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        
        UserModel result = userService.getUserById(userId);

        
        assertNull(result);
        verify(userRepository).findById(userId);
    }

    @Test
    void getAllUsers_Success() {
        
        UserModel user1 = new UserModel("user1@example.com", encodedPassword, "User 1", role);
        UserModel user2 = new UserModel("user2@example.com", encodedPassword, "User 2", role);
        List<UserModel> users = Arrays.asList(user1, user2);
        when(userRepository.findAll()).thenReturn(users);

        
        List<UserModel> result = userService.getAllUsers();

        
        assertEquals(2, result.size());
        verify(userRepository).findAll();
    }

    @Test
    void sendVerificationEmail_Success() {
        
        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        userModel.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userModel));
        when(userRepository.save(any(UserModel.class))).thenReturn(userModel);

        
        userService.sendVerificationEmail(userId);

        
        verify(userRepository).findById(userId);
        verify(userRepository).save(any(UserModel.class));
        verify(emailService).sendSimpleMessage(eq(email), eq("Email Verification"), anyString());
    }

    @Test
    void sendVerificationEmail_UserNotFound() {
        
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.sendVerificationEmail(userId)
        );

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(userId);
        verify(emailService, never()).sendSimpleMessage(anyString(), anyString(), anyString());
    }

    @Test
    void editUser_Success() {
        
        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        userModel.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userModel));
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(UserModel.class))).thenReturn(userModel);

        
        userService.editUser(userId, "New Name", description, "new@example.com", "newPassword");

        
        verify(userRepository).findById(userId);
        verify(passwordEncoder).encode("newPassword");
        verify(userRepository).save(userModel);
        assertEquals("New Name", userModel.getName());
        assertEquals(description, userModel.getDescription());
        assertEquals("new@example.com", userModel.getEmail());
        assertEquals("newEncodedPassword", userModel.getPassword());
    }

    @Test
    void blockUser_Success() {
        
        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        userModel.setId(userId);
        userModel.setActive(true);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userModel));
        when(userRepository.save(any(UserModel.class))).thenReturn(userModel);

        
        userService.blockUser(userId);

        
        assertFalse(userModel.getActive());
        verify(userRepository).findById(userId);
        verify(userRepository).save(userModel);
    }

    @Test
    void unblockUser_Success() {
        
        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        userModel.setId(userId);
        userModel.setActive(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userModel));
        when(userRepository.save(any(UserModel.class))).thenReturn(userModel);

        
        userService.unblockUser(userId);

        
        assertTrue(userModel.getActive());
        verify(userRepository).findById(userId);
        verify(userRepository).save(userModel);
    }

    @Test
    void deleteUser_Success() {
        
        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        userModel.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userModel));

        
        userService.deleteUser(userId);

        
        verify(userRepository).findById(userId);
        verify(userRepository).delete(userModel);
    }

    @Test
    void confirmUser_Success() {
        
        UserModel userModel = new UserModel(email, encodedPassword, name, role);
        userModel.setId(userId);

        UUID tokenUUID = UUID.randomUUID();
        userModel.setTokenUUID(tokenUUID);

        String token = java.util.Base64.getEncoder().encodeToString((userId.toString() + ":" + tokenUUID.toString()).getBytes());

        when(userRepository.findById(userId)).thenReturn(Optional.of(userModel));
        when(userRepository.save(any(UserModel.class))).thenReturn(userModel);

        
        userService.confirmUser(token);

        
        assertTrue(userModel.getVerified());
        verify(userRepository).findById(userId);
        verify(userRepository).save(userModel);
    }
}