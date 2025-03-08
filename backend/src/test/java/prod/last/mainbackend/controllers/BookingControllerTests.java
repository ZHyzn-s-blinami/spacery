package prod.last.mainbackend.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.BookingStatus;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.request.BookingRequest;
import prod.last.mainbackend.models.request.CheckQrRequest;
import prod.last.mainbackend.models.response.BookingCreateResponse;
import prod.last.mainbackend.models.response.BookingWithUserAndPlaceResponse;
import prod.last.mainbackend.models.response.BookingWithUserResponse;
import prod.last.mainbackend.services.BookingService;
import prod.last.mainbackend.services.UserService;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class BookingControllerTests {

    @Mock
    private BookingService bookingService;

    @Mock
    private UserService userService;

    @Mock
    private Principal principal;

    @InjectMocks
    private BookingController bookingController;

    private final UUID userId = UUID.randomUUID();
    private final UUID bookingId = UUID.randomUUID();
    private final String placeName = "Test Place";
    private final LocalDateTime startAt = LocalDateTime.now().plusDays(1);
    private final LocalDateTime endAt = LocalDateTime.now().plusDays(1).plusHours(2);
    private final String qrCode = "test-qr-code";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(principal.getName()).thenReturn(userId.toString());
    }

    @Test
    void create_Success() {
        
        BookingRequest request = new BookingRequest();
        request.setName(placeName);
        request.setStartAt(startAt);
        request.setEndAt(endAt);

        UserModel user = new UserModel();
        user.setId(userId);
        user.setVerified(true);

        BookingModel bookingModel = new BookingModel();
        bookingModel.setId(bookingId);
        bookingModel.setStartAt(startAt);
        bookingModel.setEndAt(endAt);

        when(userService.getUserById(userId)).thenReturn(user);
        when(bookingService.create(userId, placeName, startAt, endAt, true)).thenReturn(bookingModel);

        
        ResponseEntity<?> response = bookingController.create(request, principal);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(bookingModel, response.getBody());
        verify(bookingService).create(userId, placeName, startAt, endAt, true);
    }

    @Test
    void create_Error() {
        
        BookingRequest request = new BookingRequest();
        request.setName(placeName);
        request.setStartAt(startAt);
        request.setEndAt(endAt);

        UserModel user = new UserModel();
        user.setId(userId);
        user.setVerified(true);

        when(userService.getUserById(userId)).thenReturn(user);
        when(bookingService.create(userId, placeName, startAt, endAt, true)).thenThrow(new RuntimeException("Error creating booking"));

        
        ResponseEntity<?> response = bookingController.create(request, principal);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error creating booking", response.getBody());
    }

    @Test
    void cancel_Success() {
        BookingModel bookingModel = new BookingModel();
        bookingModel.setId(bookingId);
        bookingModel.setStartAt(startAt);
        bookingModel.setEndAt(endAt);

        
        when(bookingService.reject(bookingId)).thenReturn(bookingModel);
        
        ResponseEntity<?> response = bookingController.cancel(bookingId);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("{\"status\": true}", response.getBody());
        verify(bookingService).reject(bookingId);
    }

    @Test
    void cancel_Error() {
        
        doThrow(new RuntimeException("Booking not found")).when(bookingService).reject(bookingId);

        
        ResponseEntity<?> response = bookingController.cancel(bookingId);

        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("{\"status\": false}", response.getBody());
    }

    @Test
    void qr_Success() {
        
        when(bookingService.generateBookingCode(bookingId)).thenReturn(qrCode);

        
        ResponseEntity<?> response = bookingController.qr(bookingId);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals(qrCode, responseBody.get("qrCode"));
    }

    @Test
    void qr_Error() {
        
        when(bookingService.generateBookingCode(bookingId)).thenThrow(new RuntimeException("Error generating QR code"));

        
        ResponseEntity<?> response = bookingController.qr(bookingId);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error generating QR code", response.getBody());
    }

    @Test
    void qrCheck_Success() {
        
        CheckQrRequest checkQrRequest = new CheckQrRequest();
        checkQrRequest.setQrCode(qrCode);

        BookingWithUserAndPlaceResponse bookingResponse = new BookingWithUserAndPlaceResponse();
        when(bookingService.validateBookingCode(qrCode)).thenReturn(bookingResponse);

        
        ResponseEntity<?> response = bookingController.qrCheck(checkQrRequest);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(bookingResponse, response.getBody());
    }

    @Test
    void qrCheck_Error() {
        
        CheckQrRequest checkQrRequest = new CheckQrRequest();
        checkQrRequest.setQrCode(qrCode);

        when(bookingService.validateBookingCode(qrCode)).thenThrow(new RuntimeException("Invalid QR code"));

        
        ResponseEntity<?> response = bookingController.qrCheck(checkQrRequest);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid QR code", response.getBody());
    }

    @Test
    void getAllBookingByPlace_Success() {
        
        List<BookingWithUserResponse> bookings = Arrays.asList(new BookingWithUserResponse(), new BookingWithUserResponse());
        when(bookingService.findAllByPlaceId(placeName)).thenReturn(bookings);

        
        ResponseEntity<?> response = bookingController.getAllBookingByPlace(placeName);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(bookings, response.getBody());
    }

    @Test
    void getAllBookingByPlace_Error() {
        
        when(bookingService.findAllByPlaceId(placeName)).thenThrow(new RuntimeException("Place not found"));

        
        ResponseEntity<?> response = bookingController.getAllBookingByPlace(placeName);

        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Place not found", response.getBody());
    }

    @Test
    void getAllBookingByUserId_Success() {
         
        List<BookingCreateResponse> bookings = Arrays.asList(new BookingCreateResponse(), new BookingCreateResponse());
        when(bookingService.findBookingByUserId(userId)).thenReturn(bookings);

         
        ResponseEntity<?> response = bookingController.getAllBookingByUserId(principal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(bookings, response.getBody());
    }

    @Test
    void getAllBookingByUserId_Error() {
         
        when(bookingService.findBookingByUserId(userId)).thenThrow(new RuntimeException("Error fetching bookings"));

         
        ResponseEntity<?> response = bookingController.getAllBookingByUserId(principal);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Error fetching bookings", response.getBody());
    }

    @Test
    void update_Success() {
         
        BookingModel updatedBooking = new BookingModel();
        updatedBooking.setId(bookingId);
        updatedBooking.setStartAt(startAt);
        updatedBooking.setEndAt(endAt);

        when(bookingService.updateBookingTime(bookingId, startAt, endAt)).thenReturn(updatedBooking);

         
        ResponseEntity<?> response = bookingController.update(bookingId, startAt, endAt);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedBooking, response.getBody());
    }

    @Test
    void update_Error() {
         
        when(bookingService.updateBookingTime(bookingId, startAt, endAt)).thenThrow(new RuntimeException("Error updating booking"));

         
        ResponseEntity<?> response = bookingController.update(bookingId, startAt, endAt);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error updating booking", response.getBody());
    }

    @Test
    void getAllBookingByUserIdAndStatus_Success() {
         
        List<BookingCreateResponse> bookings = Arrays.asList(new BookingCreateResponse(), new BookingCreateResponse());
        when(bookingService.findAllUserBookingsByStatus(userId, BookingStatus.ACCEPTED)).thenReturn(bookings);

         
        ResponseEntity<?> response = bookingController.getAllBookingByUserIdAndStatus(BookingStatus.ACCEPTED, principal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(bookings, response.getBody());
    }

    @Test
    void getAllBookingByUserIdAndStatus_Error() {
         
        when(bookingService.findAllUserBookingsByStatus(userId, BookingStatus.ACCEPTED)).thenThrow(new RuntimeException("Error fetching bookings"));

         
        ResponseEntity<?> response = bookingController.getAllBookingByUserIdAndStatus(BookingStatus.ACCEPTED, principal);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Error fetching bookings", response.getBody());
    }
}