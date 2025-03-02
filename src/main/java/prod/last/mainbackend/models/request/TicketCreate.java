package prod.last.mainbackend.models.request;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import prod.last.mainbackend.models.TicketType;

import java.util.UUID;

@Data
public class TicketCreate {

    @NotNull
    private UUID userId;

    @NotNull
    private UUID placeId;

    @NotNull
    private TicketType ticketType;

    @NotBlank
    private String description;

}
