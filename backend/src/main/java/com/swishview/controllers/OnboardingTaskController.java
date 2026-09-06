package com.swishview.controllers;

import com.swishview.entity.OnboardingTask;
import com.swishview.services.OnboardingTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/onboarding-tasks")
@CrossOrigin(origins = "*")
public class OnboardingTaskController {
    @Autowired
    private OnboardingTaskService service;

    @GetMapping
    public List<OnboardingTask> getAll() { return service.getAllTasks(); }

    @GetMapping("/employee/{id}")
    public List<OnboardingTask> getByEmployee(@PathVariable Long id) { return service.getTasksByEmployeeId(id); }

    @PostMapping
    public OnboardingTask create(@RequestBody OnboardingTask task) { return service.saveTask(task); }
}
