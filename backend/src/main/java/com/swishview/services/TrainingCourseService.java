package com.swishview.services;

import com.swishview.entity.TrainingCourse;
import com.swishview.repositories.TrainingCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TrainingCourseService {
    @Autowired
    private TrainingCourseRepository repository;

    public List<TrainingCourse> getAllCourses() { return repository.findAll(); }
    public TrainingCourse saveCourse(TrainingCourse course) { return repository.save(course); }
    public void delete(Long id) { repository.deleteById(id); }
}

