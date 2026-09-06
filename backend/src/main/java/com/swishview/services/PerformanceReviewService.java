package com.swishview.services;

import com.swishview.entity.PerformanceReview;
import com.swishview.repositories.PerformanceReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PerformanceReviewService {
    @Autowired
    private PerformanceReviewRepository repository;

    public List<PerformanceReview> getAllReviews() { return repository.findAll(); }
    public List<PerformanceReview> getReviewsByEmployeeId(Long id) { return repository.findByEmployeeId(id); }
    public PerformanceReview saveReview(PerformanceReview review) { return repository.save(review); }
}
