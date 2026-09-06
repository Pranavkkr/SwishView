package com.swishview.services;

import com.swishview.entity.Notification;
import com.swishview.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository repository;

    public List<Notification> getAll() { return repository.findAll(); }
    public List<Notification> getByEmployeeId(Long id) { return repository.findByEmployeeId(id); }
    public Notification save(Notification notif) { return repository.save(notif); }
}
