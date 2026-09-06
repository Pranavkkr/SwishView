package com.swishview.services;

import com.swishview.entity.SavedReport;
import com.swishview.repositories.SavedReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SavedReportService {
    @Autowired
    private SavedReportRepository repository;

    public List<SavedReport> getAll() { return repository.findAll(); }
    public List<SavedReport> getByGeneratedById(Long id) { return repository.findByGeneratedById(id); }
    public SavedReport save(SavedReport report) { return repository.save(report); }
}
