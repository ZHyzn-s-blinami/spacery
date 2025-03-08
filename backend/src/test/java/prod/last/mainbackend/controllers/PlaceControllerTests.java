package prod.last.mainbackend.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.PlaceType;
import prod.last.mainbackend.models.request.BookingTime;
import prod.last.mainbackend.models.request.PlaceCreate;
import prod.last.mainbackend.services.PlaceService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class PlaceControllerTests {

    @Mock
    private PlaceService placeService;

    @InjectMocks
    private PlaceController placeController;

    private final String placeName = "Test Place";
    private final Long placeId = 1L;
    private final PlaceType placeType = PlaceType.DEFAULT;
    private final int capacity = 10;
    private final String description = "Test description";
    private final LocalDateTime startAt = LocalDateTime.now().plusDays(1);
    private final LocalDateTime endAt = LocalDateTime.now().plusDays(1).plusHours(2);
    private final UUID uuid = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getFreePlacesByTypeAndCapacity_Success() {
        
        List<PlaceModel> places = Arrays.asList(new PlaceModel(), new PlaceModel());
        when(placeService.getFreePlacesByTypeAndCapacity(placeType, capacity, startAt, endAt)).thenReturn(places);

        
        ResponseEntity<?> response = placeController.getFreePlacesByTypeAndCapacity(
                placeType.toString(), capacity, startAt, endAt);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(places, response.getBody());
    }

    @Test
    void getFreePlacesByTypeAndCapacity_Error() {
        
        when(placeService.getFreePlacesByTypeAndCapacity(placeType, capacity, startAt, endAt))
                .thenThrow(new RuntimeException("Error getting free places"));

        
        ResponseEntity<?> response = placeController.getFreePlacesByTypeAndCapacity(
                placeType.toString(), capacity, startAt, endAt);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error: Error getting free places", response.getBody());
    }

    @Test
    void createPlace_Success() {
        
        PlaceCreate placeCreate = new PlaceCreate();
        placeCreate.setType(placeType);
        placeCreate.setCapacity(capacity);
        placeCreate.setDescription(description);
        placeCreate.setPlaceId(placeId);
        placeCreate.setName(placeName);

        PlaceModel placeModel = new PlaceModel(capacity, description, placeType, placeId, placeName);
        when(placeService.createPlace(placeType, capacity, description, placeId, placeName)).thenReturn(placeModel);

        
        ResponseEntity<?> response = placeController.createPlace(placeCreate);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(placeModel, response.getBody());
    }

    @Test
    void createPlace_Error() {
        
        PlaceCreate placeCreate = new PlaceCreate();
        placeCreate.setType(placeType);
        placeCreate.setCapacity(capacity);
        placeCreate.setDescription(description);
        placeCreate.setPlaceId(placeId);
        placeCreate.setName(placeName);

        when(placeService.createPlace(placeType, capacity, description, placeId, placeName))
                .thenThrow(new RuntimeException("Error creating place"));

        
        ResponseEntity<?> response = placeController.createPlace(placeCreate);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error: Error creating place", response.getBody());
    }

    @Test
    void getPlaceById_Success() {
        
        PlaceModel placeModel = new PlaceModel(capacity, description, placeType, placeId, placeName);
        when(placeService.getByName(placeName)).thenReturn(Optional.of(placeModel));

        
        ResponseEntity<?> response = placeController.getPlaceById(placeName);

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Optional.of(placeModel), response.getBody());
    }

    @Test
    void getPlaceById_Error() {
        
        when(placeService.getByName(placeName)).thenThrow(new RuntimeException("Place not found"));

        
        ResponseEntity<?> response = placeController.getPlaceById(placeName);

        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error: Place not found", response.getBody());
    }

    @Test
    void getAllPlaces_Success() {
        
        List<PlaceModel> places = Arrays.asList(new PlaceModel(), new PlaceModel());
        when(placeService.getAllPlaces()).thenReturn(places);

        
        ResponseEntity<?> response = placeController.getAllPlaces();

        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(places, response.getBody());
    }

    @Test
    void getAllPlaces_Error() {
        
        when(placeService.getAllPlaces()).thenThrow(new RuntimeException("Error getting places"));

        ResponseEntity<?> response = placeController.getAllPlaces();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error: Error getting places", response.getBody());
    }

    @Test
    void createPlaces_Success() {
        PlaceCreate placeCreate1 = new PlaceCreate();
        placeCreate1.setType(placeType);
        placeCreate1.setCapacity(capacity);
        placeCreate1.setDescription(description);
        placeCreate1.setPlaceId(placeId);
        placeCreate1.setName(placeName);

        PlaceCreate placeCreate2 = new PlaceCreate();
        placeCreate2.setType(placeType);
        placeCreate2.setCapacity(capacity + 5);
        placeCreate2.setDescription(description + " 2");
        placeCreate2.setPlaceId(placeId + 1);
        placeCreate2.setName(placeName + " 2");

        List<PlaceCreate> placeCreates = Arrays.asList(placeCreate1, placeCreate2);

        PlaceModel placeModel1 = new PlaceModel(capacity, description, placeType, placeId, placeName);
        PlaceModel placeModel2 = new PlaceModel(
                capacity + 5, description + " 2", placeType, placeId + 1, placeName + " 2");
        List<PlaceModel> placeModels = Arrays.asList(placeModel1, placeModel2);

        when(placeService.createPlaces(placeCreates)).thenReturn(placeModels);

        ResponseEntity<?> response = placeController.createPlaces(placeCreates);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(placeModels, response.getBody());
    }

    @Test
    void createPlaces_Error() {
        List<PlaceCreate> placeCreates = Arrays.asList(new PlaceCreate(), new PlaceCreate());
        when(placeService.createPlaces(placeCreates)).thenThrow(new RuntimeException("Error creating places"));

        ResponseEntity<?> response = placeController.createPlaces(placeCreates);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error: Error creating places", response.getBody());
    }

    @Test
    void findBookingTimeByPlaceId_Success() {
        BookingTime bookingTime1 = new BookingTime();
        bookingTime1.setStart(startAt);
        bookingTime1.setEnd(endAt);

        BookingTime bookingTime2 = new BookingTime();
        bookingTime2.setStart(startAt.plusDays(1));
        bookingTime2.setEnd(endAt.plusDays(1));

        List<BookingTime> bookingTimes = Arrays.asList(bookingTime1, bookingTime2);
        when(placeService.findBookingTimeByPlaceId(placeName)).thenReturn(bookingTimes);

        ResponseEntity<?> response = placeController.findBookingTimeByPlaceId(placeName);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(bookingTimes, response.getBody());
    }

    @Test
    void findBookingTimeByPlaceId_Error() {
        when(placeService.findBookingTimeByPlaceId(placeName))
                .thenThrow(new RuntimeException("Error finding booking times"));

        ResponseEntity<?> response = placeController.findBookingTimeByPlaceId(placeName);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(null, response.getBody());
    }
}