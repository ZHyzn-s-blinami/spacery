package prod.last.mainbackend.models.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingTime {

    private LocalDateTime start;

    private LocalDateTime end;

}
