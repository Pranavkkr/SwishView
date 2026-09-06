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
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private Employee assignee;

    private LocalDate dueDate;

    private String status; // TO_DO, IN_PROGRESS, REVIEW, COMPLETED

    // Proof fields
    private String submissionLink;
    
    @Column(columnDefinition = "TEXT")
    private String submissionNote;
    
    private String submissionFileUrl;
    
    // Task report PDF
    private String reportFileUrl;

}
