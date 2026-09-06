package com.swishview.controllers;

import com.swishview.entity.PerformanceReview;
import com.swishview.services.PerformanceReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/performance-reviews")
@CrossOrigin(origins = "*")
public class PerformanceReviewController {
    @Autowired
    private PerformanceReviewService service;

    @GetMapping
    public List<PerformanceReview> getAll() { return service.getAllReviews(); }

    @GetMapping("/employee/{id}")
    public List<PerformanceReview> getByEmployee(@PathVariable Long id) { return service.getReviewsByEmployeeId(id); }

    @PostMapping
    public PerformanceReview create(@RequestBody PerformanceReview review) { return service.saveReview(review); }
}
