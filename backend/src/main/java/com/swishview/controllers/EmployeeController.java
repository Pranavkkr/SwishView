package com.swishview.controllers;

import com.swishview.entity.Employee;
import com.swishview.repositories.EmployeeRepository;
import com.swishview.services.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private com.swishview.repositories.UserRepository userRepository;

    @Autowired
    private com.swishview.repositories.TaskRepository taskRepository;

    @Autowired
    private com.swishview.repositories.AttendanceRepository attendanceRepository;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    /**
     * Returns the Employee record linked to the currently authenticated user.
     * The JWT username is the user's email address.
     */
    @GetMapping("/me")
    public ResponseEntity<Employee> getMyProfile(Authentication authentication) {
        String email = authentication.getName(); // email stored as JWT subject
        return employeeRepository.findByUserEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/team")
    public ResponseEntity<com.swishview.entity.Team> getMyTeam(Authentication authentication) {
        String email = authentication.getName();
        return employeeRepository.findByUserEmail(email)
                .map(Employee::getTeam)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeById(id);
        return employee != null ? ResponseEntity.ok(employee) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
        com.swishview.entity.User user = userRepository.findByEmail(employee.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User account not found for email. Create user first.");
        }
        employee.setUser(user);
        return ResponseEntity.ok(employeeService.saveEmployee(employee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee updatedDetails) {
        Employee employee = employeeService.getEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (updatedDetails.getFirstName() != null) employee.setFirstName(updatedDetails.getFirstName());
        if (updatedDetails.getLastName() != null) employee.setLastName(updatedDetails.getLastName());
        if (updatedDetails.getDepartment() != null) employee.setDepartment(updatedDetails.getDepartment());
        if (updatedDetails.getDesignation() != null) employee.setDesignation(updatedDetails.getDesignation());
        
        return ResponseEntity.ok(employeeService.saveEmployee(employee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<java.util.Map<String, Object>> getEmployeeAnalytics(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.notFound().build();
        }

        List<com.swishview.entity.Task> tasks = taskRepository.findByAssigneeId(id);
        List<com.swishview.entity.Attendance> attendance = attendanceRepository.findByEmployeeId(id);
        
        long completedTasks = tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        int productivityScore = tasks.isEmpty() ? 0 : (int) ((completedTasks * 100.0) / tasks.size());

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("employee", employee);
        response.put("tasks", tasks);
        response.put("attendance", attendance);
        response.put("productivityScore", productivityScore);
        
        return ResponseEntity.ok(response);
    }
}
