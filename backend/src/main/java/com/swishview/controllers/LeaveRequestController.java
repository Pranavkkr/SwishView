package com.swishview.controllers;

import com.swishview.entity.LeaveRequest;
import com.swishview.services.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leave-requests")
@CrossOrigin(origins = "*")
public class LeaveRequestController {
    @Autowired
    private LeaveRequestService service;

    @GetMapping
    public List<LeaveRequest> getAll() { return service.getAll(); }

    @GetMapping("/employee/{id}")
    public List<LeaveRequest> getByEmployee(@PathVariable Long id) { return service.getByEmployeeId(id); }

    @PostMapping
    public ResponseEntity<LeaveRequest> create(@RequestBody LeaveRequest req) {
        return ResponseEntity.ok(service.save(req));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LeaveRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.getById(id).map(req -> {
            req.setStatus(status);
            return ResponseEntity.ok(service.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

