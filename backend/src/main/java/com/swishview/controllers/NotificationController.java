package com.swishview.controllers;

import com.swishview.entity.Notification;
import com.swishview.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    @Autowired
    private NotificationService service;

    @GetMapping
    public List<Notification> getAll() { return service.getAll(); }

    @GetMapping("/employee/{id}")
    public List<Notification> getByEmployee(@PathVariable Long id) { return service.getByEmployeeId(id); }

    @PostMapping
    public Notification create(@RequestBody Notification req) { return service.save(req); }
}
