package com.swishview.services;

import com.swishview.entity.LeaveRequest;
import com.swishview.repositories.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveRequestService {
    @Autowired
    private LeaveRequestRepository repository;

    public List<LeaveRequest> getAll() { return repository.findAll(); }
    public List<LeaveRequest> getByEmployeeId(Long id) { return repository.findByEmployeeId(id); }
    public Optional<LeaveRequest> getById(Long id) { return repository.findById(id); }
    public LeaveRequest save(LeaveRequest req) { return repository.save(req); }
    public void delete(Long id) { repository.deleteById(id); }
}

