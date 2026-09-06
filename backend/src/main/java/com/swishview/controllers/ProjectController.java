package com.swishview.controllers;

import com.swishview.entity.Project;
import com.swishview.services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        return project != null ? ResponseEntity.ok(project) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public Project createProject(@RequestBody Project project) {
        return projectService.saveProject(project);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Project> updateProjectStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Project project = projectService.getProjectById(id);
        if (project == null) return ResponseEntity.notFound().build();
        if (body.containsKey("status")) {
            project.setStatus(body.get("status"));
            projectService.saveProject(project);
        }
        return ResponseEntity.ok(project);
    }
    @PostMapping("/{id}/report")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Project> uploadProjectReport(
            @PathVariable Long id,
            @RequestParam("reportFile") org.springframework.web.multipart.MultipartFile reportFile
    ) {
        Project project = projectService.getProjectById(id);
        if (project == null) return ResponseEntity.notFound().build();

        if (reportFile != null && !reportFile.isEmpty()) {
            try {
                String filename = "project_report_" + System.currentTimeMillis() + "_" + reportFile.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads").toAbsolutePath();
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                java.nio.file.Path filePath = uploadPath.resolve(filename);
                java.nio.file.Files.copy(reportFile.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                project.setReportFileUrl("/uploads/" + filename);
                projectService.saveProject(project);
            } catch (java.io.IOException e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().build();
            }
        }
        return ResponseEntity.ok(project);
    }
}
