package prod.last.mainbackend.models.request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BookingRequest {

    private UUID placeId;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

}
