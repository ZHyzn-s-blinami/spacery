package prod.last.mainbackend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.BookingStatus;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.models.response.BookingCreateResponse;
import prod.last.mainbackend.models.response.BookingWithUserAndPlaceResponse;
import prod.last.mainbackend.models.response.BookingWithUserResponse;
import prod.last.mainbackend.repositories.BookingRepository;
import prod.last.mainbackend.repositories.PlaceRepository;
import prod.last.mainbackend.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTests {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PlaceRepository placeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private BookingService bookingService;

    @Captor
    private ArgumentCaptor<BookingModel> bookingCaptor;

    private final UUID userId = UUID.randomUUID();
    private final UUID placeId = UUID.randomUUID();
    private final UUID bookingId = UUID.randomUUID();
    private final String placeName = "Переговорная комната";
    private final String userEmail = "test@example.com";
    private final LocalDateTime startTime = LocalDateTime.now().plusHours(1);
    private final LocalDateTime endTime = LocalDateTime.now().plusHours(2);
    private final String secretKey = "ThisIsASecretKeyForTestingPurposesOnly12345678901234567890";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "SECRET_KEY", secretKey);
    }

    @Test
    void create_Success() {
        
        PlaceModel place = new PlaceModel();
        place.setId(placeId);
        place.setName(placeName);

        UserModel user = new UserModel();
        user.setId(userId);
        user.setEmail(userEmail);

        BookingModel bookingModel = new BookingModel(userId, placeId, startTime, endTime);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(placeRepository.findByName(placeName)).thenReturn(Optional.of(place));
        when(bookingRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(BookingModel.class))).thenReturn(bookingModel);

        
        BookingModel result = bookingService.create(userId, placeName, startTime, endTime);

        
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(placeId, result.getPlaceId());
        assertEquals(startTime, result.getStartAt());
        assertEquals(endTime, result.getEndAt());

        verify(bookingRepository).findAllByUserId(userId);
        verify(placeRepository).findByName(placeName);
        verify(userRepository).findById(userId);
        verify(emailService).sendMessageWithAttachment(eq(userEmail), eq("Создание бронирования"), anyString(), eq("booking.ics"), any(byte[].class));
        verify(bookingRepository).save(any(BookingModel.class));
    }

    @Test
    void create_PlaceNotFound() {
        
        when(placeRepository.findByName(placeName)).thenReturn(Optional.empty());

        
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.create(userId, placeName, startTime, endTime)
        );
        assertEquals("Place not found", exception.getMessage());

        verify(placeRepository).findByName(placeName);
        verify(bookingRepository, never()).save(any(BookingModel.class));
    }

    @Test
    void create_UserNotFound() {
        
        PlaceModel place = new PlaceModel();
        place.setId(placeId);
        place.setName(placeName);

        when(placeRepository.findByName(placeName)).thenReturn(Optional.of(place));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        when(bookingRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());

        
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.create(userId, placeName, startTime, endTime)
        );
        assertEquals("User not found", exception.getMessage());

        verify(placeRepository).findByName(placeName);
        verify(userRepository).findById(userId);
        verify(bookingRepository, never()).save(any(BookingModel.class));
    }

    @Test
    void create_OverlappingBooking() {
        
        PlaceModel place = new PlaceModel();
        place.setId(placeId);
        place.setName(placeName);

        List<BookingModel> existingBookings = Collections.singletonList(
                new BookingModel(userId, placeId, startTime.minusMinutes(30), endTime.minusMinutes(30))
        );
        existingBookings.get(0).updateStatus(BookingStatus.PENDING);

        
        
        when(bookingRepository.findAllByUserId(userId)).thenReturn(existingBookings);

        
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.create(userId, placeName, startTime, endTime)
        );
        assertEquals("User already has a booking in the specified time range", exception.getMessage());

        verify(bookingRepository).findAllByUserId(userId);
        verify(bookingRepository, never()).save(any(BookingModel.class));
    }

    @Test
    void reject_Success() {
        
        BookingModel booking = new BookingModel(userId, placeId, startTime, endTime);
        booking.setId(bookingId);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(BookingModel.class))).thenAnswer(i -> i.getArgument(0));

        
        BookingModel result = bookingService.reject(bookingId);

        
        assertEquals(BookingStatus.REJECTED, result.getStatus());
        verify(bookingRepository).findById(bookingId);
        verify(bookingRepository).save(booking);
    }

    @Test
    void generateAndValidateBookingCode_Success() {
        
        BookingModel booking = new BookingModel(userId, placeId, startTime, endTime);
        booking.setId(bookingId);
        booking.updateStatus(BookingStatus.PENDING);

        UserModel user = new UserModel();
        user.setId(userId);

        PlaceModel place = new PlaceModel();
        place.setId(placeId);

        
        BookingModel updatedBooking = new BookingModel(userId, placeId, startTime, endTime);
        updatedBooking.setId(bookingId);
        updatedBooking.updateStatus(BookingStatus.ACCEPTED);
        updatedBooking.setCreatedAt(booking.getCreatedAt());

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(placeRepository.findById(placeId)).thenReturn(Optional.of(place));
        when(bookingRepository.save(any(BookingModel.class))).thenReturn(updatedBooking);

        
        String token = bookingService.generateBookingCode(bookingId);
        BookingWithUserAndPlaceResponse result = bookingService.validateBookingCode(token);

        
        assertNotNull(result);
        assertEquals(BookingStatus.ACCEPTED.name(), result.getStatus());
        assertEquals(user, result.getUser());
        assertEquals(place, result.getPlace());

        verify(bookingRepository, times(1)).findById(bookingId); 
        verify(bookingRepository).save(any(BookingModel.class));
    }

    @Test
    void findAllByUserId_Success() {
        
        List<BookingModel> bookings = Arrays.asList(
                new BookingModel(userId, placeId, startTime, endTime),
                new BookingModel(userId, placeId, startTime.plusHours(3), endTime.plusHours(3))
        );

        when(bookingRepository.findAllByUserId(userId)).thenReturn(bookings);

        
        List<BookingModel> result = bookingService.findAllByUserId(userId);

        
        assertEquals(2, result.size());
        verify(bookingRepository).findAllByUserId(userId);
    }

    @Test
    void findBookingByUserId_Success() {
        
        BookingModel booking = new BookingModel(userId, placeId, startTime, endTime);
        booking.setId(bookingId);

        PlaceModel place = new PlaceModel();
        place.setId(placeId);

        when(bookingRepository.findAllByUserId(userId)).thenReturn(Collections.singletonList(booking));
        when(placeRepository.findById(placeId)).thenReturn(Optional.of(place));

        
        List<BookingCreateResponse> result = bookingService.findBookingByUserId(userId);

        
        assertEquals(1, result.size());
        assertEquals(bookingId.toString(), result.get(0).getBookingId());
        assertEquals(place, result.get(0).getPlace());

        verify(bookingRepository).findAllByUserId(userId);
        verify(placeRepository).findById(placeId);
    }

    @Test
    void findAllByPlaceId_Success() {
        
        PlaceModel place = new PlaceModel();
        place.setId(placeId);
        place.setName(placeName);

        BookingModel booking = new BookingModel(userId, placeId, startTime, endTime);
        booking.setId(UUID.randomUUID()); 

        UserModel user = new UserModel();
        user.setId(userId);

        when(placeRepository.findByName(placeName)).thenReturn(Optional.of(place));
        when(bookingRepository.findAllByPlaceId(placeId)).thenReturn(Collections.singletonList(booking));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        
        List<BookingWithUserResponse> result = bookingService.findAllByPlaceId(placeName);

        
        assertEquals(1, result.size());
        assertEquals(user, result.get(0).getUser());

        verify(placeRepository).findByName(placeName);
        verify(bookingRepository).findAllByPlaceId(placeId);
        verify(userRepository).findById(userId);
    }

    @Test
    void updateBookingTime_Success() {
        
        BookingModel booking = new BookingModel(userId, placeId, startTime, endTime);
        booking.setId(bookingId);
        booking.updateStatus(BookingStatus.PENDING);

        LocalDateTime newStart = startTime.plusHours(1);
        LocalDateTime newEnd = endTime.plusHours(1);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.findAllByPlaceId(placeId)).thenReturn(Collections.singletonList(booking));
        when(bookingRepository.save(any(BookingModel.class))).thenAnswer(i -> i.getArgument(0));

        
        BookingModel result = bookingService.updateBookingTime(bookingId, newStart, newEnd);

        
        assertEquals(newStart, result.getStartAt());
        assertEquals(newEnd, result.getEndAt());
        assertEquals(BookingStatus.PENDING, result.getStatus());
        assertFalse(result.isSentNotification());

        verify(bookingRepository).findById(bookingId);
        verify(bookingRepository).findAllByPlaceId(placeId);
        verify(bookingRepository).save(booking);
    }

    @Test
    void findAllUserBookingsByStatus_Success() {
        
        BookingModel booking = new BookingModel(userId, placeId, startTime, endTime);
        booking.setId(bookingId); 
        booking.updateStatus(BookingStatus.ACCEPTED);

        PlaceModel place = new PlaceModel();
        place.setId(placeId);

        when(bookingRepository.findAllByUserIdAndStatusOrderByStartAtAscCreatedAtDesc(userId, BookingStatus.ACCEPTED))
                .thenReturn(Collections.singletonList(booking));
        when(placeRepository.findById(placeId)).thenReturn(Optional.of(place));

        
        List<BookingCreateResponse> result = bookingService.findAllUserBookingsByStatus(userId, BookingStatus.ACCEPTED);

        
        assertEquals(1, result.size());
        assertEquals(place, result.get(0).getPlace());
        assertEquals(BookingStatus.ACCEPTED.name(), result.get(0).getStatus());

        verify(bookingRepository).findAllByUserIdAndStatusOrderByStartAtAscCreatedAtDesc(userId, BookingStatus.ACCEPTED);
        verify(placeRepository).findById(placeId);
    }

    @Test
    void checkAndUpdateBookingStatus() {
        
        BookingModel pendingBooking = new BookingModel(userId, placeId, LocalDateTime.now().minusHours(1), endTime);
        pendingBooking.updateStatus(BookingStatus.PENDING);

        BookingModel notificationBooking = new BookingModel(userId, placeId, LocalDateTime.now().plusMinutes(10), endTime);
        notificationBooking.updateStatus(BookingStatus.PENDING);

        UserModel user = new UserModel();
        user.setId(userId);
        user.setEmail(userEmail);

        when(bookingRepository.findAll()).thenReturn(Arrays.asList(pendingBooking, notificationBooking));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookingRepository.save(any(BookingModel.class))).thenAnswer(i -> i.getArgument(0));

        
        bookingService.checkAndUpdateBookingStatus();

        
        verify(bookingRepository).findAll();
        verify(bookingRepository, times(2)).save(bookingCaptor.capture());

        List<BookingModel> savedBookings = bookingCaptor.getAllValues();
        BookingModel overdue = savedBookings.get(0);
        BookingModel notified = savedBookings.get(1);

        assertEquals(BookingStatus.OVERDUE, overdue.getStatus());
        assertEquals(BookingStatus.PENDING, notified.getStatus());
        assertTrue(notified.isSentNotification());

        verify(emailService).sendSimpleMessage(eq(userEmail), eq("Напоминание о бронировании"), anyString());
    }
}