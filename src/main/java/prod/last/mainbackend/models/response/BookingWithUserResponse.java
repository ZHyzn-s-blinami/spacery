package prod.last.mainbackend.models.response;

import lombok.Data;
import prod.last.mainbackend.models.UserModel;

@Data
public class BookingWithUserResponse {

    private String bookingId;

    private UserModel user;

    private String startAt;

    private String endAt;

    private String status;

    private String createdAt;

    private String updatedAt;

}
