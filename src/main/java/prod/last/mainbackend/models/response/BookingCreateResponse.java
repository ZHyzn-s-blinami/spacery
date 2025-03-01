package prod.last.mainbackend.models.response;

import lombok.Data;
import prod.last.mainbackend.models.BookingModel;
import prod.last.mainbackend.models.PlaceModel;

@Data
public class BookingCreateResponse {

    private String bookingId;

    private PlaceModel place;

    private String startAt;

    private String endAt;

    private String status;

    private String createdAt;

    private String updatedAt;
}
