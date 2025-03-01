package prod.last.mainbackend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "ticket")
public class TicketModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    private UUID userId;

    @NotNull
    private UUID placeId;

    @NotNull
    private UUID bookingId;

    private String problem;

    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;
}
