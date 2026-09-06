package com.swishview.services;

import com.swishview.entity.OnboardingTask;
import com.swishview.repositories.OnboardingTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OnboardingTaskService {
    @Autowired
    private OnboardingTaskRepository repository;

    public List<OnboardingTask> getAllTasks() { return repository.findAll(); }
    public List<OnboardingTask> getTasksByEmployeeId(Long id) { return repository.findByEmployeeId(id); }
    public OnboardingTask saveTask(OnboardingTask task) { return repository.save(task); }
}
