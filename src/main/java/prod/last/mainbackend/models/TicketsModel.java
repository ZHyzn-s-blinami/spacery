package prod.last.mainbackend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "tickets")
public class TicketsModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    private UUID userId;

    @NotNull
    private UUID placeId;

    private Character zone;

    private String placeName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private TicketType ticketType;

    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.OPEN;

    public TicketsModel() {
    }

    public TicketsModel(UUID userId, UUID placeId, TicketType ticketType, String description, Character zone, String placeName) {
        this.userId = userId;
        this.placeId = placeId;
        this.ticketType = ticketType;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.zone = zone;
        this.placeName = placeName;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
