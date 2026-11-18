package com.bloodmatcher.bloodmatcher.entity;

import com.bloodmatcher.bloodmatcher.enums.ResponseStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "donor_responses",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_response_request_donor",
                        columnNames = {"request_id", "donor_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor

public class DonorResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private BloodRequest request;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResponseStatus status = ResponseStatus.NOTIFIED;

    @Column(name = "notified_at", nullable = false)
    private LocalDateTime notifiedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @PrePersist
    private void initializeNotificationDate() {
        if (notifiedAt == null) {
            notifiedAt = LocalDateTime.now();
        }
    }
}