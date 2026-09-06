package com.swishview.controllers;

import com.swishview.entity.Task;
import com.swishview.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }
    
    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProjectId(@PathVariable Long projectId) {
        return taskService.getTasksByProjectId(projectId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return task != null ? ResponseEntity.ok(task) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public Task createTask(@RequestBody Task task) {
        return taskService.saveTask(task);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "submissionLink", required = false) String submissionLink,
            @RequestParam(value = "submissionNote", required = false) String submissionNote,
            @RequestParam(value = "proofFile", required = false) org.springframework.web.multipart.MultipartFile proofFile
    ) {
        Task task = taskService.getTaskById(id);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }
        
        task.setStatus(status);
        if (submissionLink != null) task.setSubmissionLink(submissionLink);
        if (submissionNote != null) task.setSubmissionNote(submissionNote);
        
        if (proofFile != null && !proofFile.isEmpty()) {
            try {
                String filename = System.currentTimeMillis() + "_" + proofFile.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads").toAbsolutePath();
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                java.nio.file.Path filePath = uploadPath.resolve(filename);
                java.nio.file.Files.copy(proofFile.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                task.setSubmissionFileUrl("/uploads/" + filename);
            } catch (java.io.IOException e) {
                e.printStackTrace();
            }
        }
        
        taskService.saveTask(task);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Task> uploadTaskReport(
            @PathVariable Long id,
            @RequestParam("reportFile") org.springframework.web.multipart.MultipartFile reportFile
    ) {
        Task task = taskService.getTaskById(id);
        if (task == null) return ResponseEntity.notFound().build();

        if (reportFile != null && !reportFile.isEmpty()) {
            try {
                String filename = "report_" + System.currentTimeMillis() + "_" + reportFile.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads").toAbsolutePath();
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                java.nio.file.Path filePath = uploadPath.resolve(filename);
                java.nio.file.Files.copy(reportFile.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                task.setReportFileUrl("/uploads/" + filename);
                taskService.saveTask(task);
            } catch (java.io.IOException e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().build();
            }
        }
        return ResponseEntity.ok(task);
    }


}
