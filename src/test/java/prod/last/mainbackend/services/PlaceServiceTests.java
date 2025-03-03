package prod.last.mainbackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.PlaceType;
import prod.last.mainbackend.models.request.BookingTime;
import prod.last.mainbackend.models.request.PlaceCreate;
import prod.last.mainbackend.repositories.BookingRepository;
import prod.last.mainbackend.repositories.PlaceRepository;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PlaceServiceTests {

    @Mock
    private PlaceRepository placeRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private PlaceService placeService;

    private UUID placeId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private PlaceModel placeModel;
    private List<PlaceModel> placeModels;

    @BeforeEach
    void setUp() {
        placeId = UUID.randomUUID();
        startTime = LocalDateTime.now();
        endTime = startTime.plusHours(1);
        placeModel = new PlaceModel(10, "Описание", PlaceType.MEETING, 1L, "Переговорная комната");
        placeModel.setId(placeId);
        placeModels = Collections.singletonList(placeModel);
    }

    @Test
    void getFreePlacesByTypeAndCapacity_Success() {
        
        when(placeRepository.findFreePlacesByTypeAndCapacity(PlaceType.MEETING, 5, startTime, endTime))
                .thenReturn(placeModels);

        
        List<PlaceModel> result = placeService.getFreePlacesByTypeAndCapacity(PlaceType.MEETING, 5, startTime, endTime);

        
        assertEquals(1, result.size());
        assertEquals(placeModel, result.get(0));
        verify(placeRepository).findFreePlacesByTypeAndCapacity(PlaceType.MEETING, 5, startTime, endTime);
    }

    @Test
    void createPlace_Success() {
        
        when(placeRepository.save(any(PlaceModel.class))).thenReturn(placeModel);

        
        PlaceModel result = placeService.createPlace(PlaceType.MEETING, 10, "Описание", 1L, "Переговорная комната");

        
        assertEquals(placeModel, result);
        verify(placeRepository).save(any(PlaceModel.class));
    }

    @Test
    void getPlaceById_Success() {
        
        when(placeRepository.findById(placeId)).thenReturn(Optional.of(placeModel));

        
        PlaceModel result = placeService.getPlaceById(placeId);

        
        assertEquals(placeModel, result);
        verify(placeRepository).findById(placeId);
    }

    @Test
    void getPlaceById_NotFound() {
        
        when(placeRepository.findById(placeId)).thenReturn(Optional.empty());

        
        PlaceModel result = placeService.getPlaceById(placeId);

        
        assertNull(result);
        verify(placeRepository).findById(placeId);
    }

    @Test
    void getAllPlaces_Success() {
        
        when(placeRepository.findAll()).thenReturn(placeModels);

        
        List<PlaceModel> result = placeService.getAllPlaces();

        
        assertEquals(placeModels, result);
        verify(placeRepository).findAll();
    }

    @Test
    void createPlaces_Success() {
        
        List<PlaceCreate> placeCreates = Collections.singletonList(
            new PlaceCreate(PlaceType.MEETING, 10, "Описание", 1L, "Переговорная комната")
        );
        when(placeRepository.saveAll(anyList())).thenReturn(placeModels);

        
        List<PlaceModel> result = placeService.createPlaces(placeCreates);

        
        assertEquals(placeModels, result);
        verify(placeRepository).saveAll(anyList());
    }

    @Test
    void getByName_Success() {
        
        String name = "Переговорная комната";
        when(placeRepository.findByName(name)).thenReturn(Optional.of(placeModel));

        
        Optional<PlaceModel> result = placeService.getByName(name);

        
        assertTrue(result.isPresent());
        assertEquals(placeModel, result.get());
        verify(placeRepository).findByName(name);
    }

    @Test
    void findBookingTimeByPlaceId_Success() {
        
        String name = "Переговорная комната";
        BookingModel bookingModel = new BookingModel(UUID.randomUUID(), placeId, startTime, endTime);
        bookingModel.setId(UUID.randomUUID());

        when(placeRepository.findByName(name)).thenReturn(Optional.of(placeModel));
        when(bookingRepository.findAllByPlaceId(placeId)).thenReturn(Collections.singletonList(bookingModel));

        
        List<BookingTime> result = placeService.findBookingTimeByPlaceId(name);

        
        assertEquals(1, result.size());
        assertEquals(startTime, result.get(0).getStart());
        assertEquals(endTime, result.get(0).getEnd());

        verify(placeRepository).findByName(name);
        verify(bookingRepository).findAllByPlaceId(placeId);
    }

    @Test
    void findBookingTimeByPlaceId_PlaceNotFound() {
        
        String name = "Несуществующая комната";
        when(placeRepository.findByName(name)).thenReturn(Optional.empty());

        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> placeService.findBookingTimeByPlaceId(name));
        assertEquals("Place not found", exception.getMessage());

        verify(placeRepository).findByName(name);
        verify(bookingRepository, never()).findAllByPlaceId(any());
    }
}