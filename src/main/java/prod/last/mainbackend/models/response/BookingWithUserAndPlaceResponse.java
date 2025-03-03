package prod.last.mainbackend.models.response;

import lombok.Data;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.PlaceModel;
import prod.last.mainbackend.models.UserModel;

@Data
public class BookingWithUserAndPlaceResponse {
    private String bookingId;

    private PlaceModel place;

    private UserModel user;

    private String startAt;

    private String endAt;

    private String status;

    private String createdAt;

    private String updatedAt;

    public BookingWithUserAndPlaceResponse(BookingModel booking, UserModel user, PlaceModel place) {
        this.bookingId = booking.getId().toString();
        this.place = place;
        this.user = user;
        this.startAt = booking.getStartAt().toString();
        this.endAt = booking.getEndAt().toString();
        this.status = booking.getStatus().name();
        this.createdAt = booking.getCreatedAt().toString();
        this.updatedAt = booking.getUpdatedAt().toString();
    }
}
