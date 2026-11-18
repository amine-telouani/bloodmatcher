package com.bloodmatcher.bloodmatcher.entity;

import com.bloodmatcher.bloodmatcher.enums.BloodType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "donors")
@Getter
@Setter
@NoArgsConstructor

public class Donor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name="user_id", nullable = false, unique = true)
    private User user;

    @Column(name="full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name="blood_type", nullable = false)
    private BloodType bloodType;

    @Column(nullable=false)
    private double latitude;

    @Column(nullable=false)
    private double longitude;

    @Column(nullable=false)
    private boolean available = true;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;

    @Column(nullable = false)
    private String phone;
}
