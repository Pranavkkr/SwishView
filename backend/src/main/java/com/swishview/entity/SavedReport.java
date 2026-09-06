package com.swishview.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "saved_reports")
public class SavedReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type; // e.g. HR, Financial, Productivity
    private LocalDate generatedDate;
    
    @ManyToOne
    @JoinColumn(name = "generated_by_id", nullable = false)
    private Employee generatedBy;
}
