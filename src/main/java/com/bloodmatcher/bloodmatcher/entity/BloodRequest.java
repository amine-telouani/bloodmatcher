package com.bloodmatcher.bloodmatcher.entity;

import com.bloodmatcher.bloodmatcher.enums.BloodType;
import com.bloodmatcher.bloodmatcher.enums.RequestStatus;
import com.bloodmatcher.bloodmatcher.enums.Urgency;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "blood_requests")
@Getter
@Setter
@NoArgsConstructor

public class BloodRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Enumerated(EnumType.STRING)
    @Column(name= "blood_type", nullable = false)
    private BloodType bloodType;

    @Column(name = "units_needed", nullable = false)
    private int unitsNeeded;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Urgency urgency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.OPEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(name = "current_radius_km", nullable = false)
    private int currentRadiusKm = 5;

    @Column(name = "last_escalation_at", nullable = false)
    private LocalDateTime lastEscalationAt;

    @Version
    private Long version;

    @PrePersist
    private void initializeDates(){
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (lastEscalationAt == null) {
            lastEscalationAt = createdAt;
        }
    }
}