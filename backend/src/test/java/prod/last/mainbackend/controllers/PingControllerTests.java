package prod.last.mainbackend.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class PingControllerTests {

    @InjectMocks
    private PingController pingController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void ping_Success() {
        ResponseEntity<?> response = pingController.ping();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("PROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOD", response.getBody());
    }

    @Test
    void pong_Success() {
        ResponseEntity<?> response = pingController.pong();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("PONG", response.getBody());
    }

    @Test
    void adminOnlyEndpoint_Success() {
        ResponseEntity<?> response = pingController.adminOnlyEndpoint();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("This is an admin-only endpoint", response.getBody());
    }
}