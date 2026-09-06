package com.swishview.controllers;

import com.swishview.entity.TrainingCourse;
import com.swishview.services.TrainingCourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/training-courses")
@CrossOrigin(origins = "*")
public class TrainingCourseController {
    @Autowired
    private TrainingCourseService service;

    @GetMapping
    public List<TrainingCourse> getAll() { return service.getAllCourses(); }

    @PostMapping
    public ResponseEntity<TrainingCourse> create(@RequestBody TrainingCourse course) {
        return ResponseEntity.ok(service.saveCourse(course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

