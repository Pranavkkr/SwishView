package com.swishview.controllers;

import com.swishview.entity.SavedReport;
import com.swishview.services.SavedReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/saved-reports")
@CrossOrigin(origins = "*")
public class SavedReportController {
    @Autowired
    private SavedReportService service;

    @GetMapping
    public List<SavedReport> getAll() { return service.getAll(); }

    @GetMapping("/employee/{id}")
    public List<SavedReport> getByEmployee(@PathVariable Long id) { return service.getByGeneratedById(id); }

    @PostMapping
    public SavedReport create(@RequestBody SavedReport req) { return service.save(req); }
}
