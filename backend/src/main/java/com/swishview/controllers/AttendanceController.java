package com.swishview.controllers;

import com.swishview.entity.Attendance;
import com.swishview.entity.Employee;
import com.swishview.repositories.AttendanceRepository;
import com.swishview.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @GetMapping("/employee/{employeeId}")
    public List<Attendance> getAttendanceByEmployee(@PathVariable Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    @PostMapping("/mark")
    public ResponseEntity<Attendance> markAttendance(@RequestBody Map<String, String> body) {
        Long employeeId = Long.parseLong(body.get("employeeId"));
        LocalDate date = LocalDate.parse(body.get("date"));
        String status = body.get("status");

        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Attendance> existingOpt = attendanceRepository.findByEmployeeIdAndDate(employeeId, date);
        Attendance attendance;
        if (existingOpt.isPresent()) {
            attendance = existingOpt.get();
            attendance.setStatus(status);
        } else {
            attendance = new Attendance();
            attendance.setEmployee(employeeOpt.get());
            attendance.setDate(date);
            attendance.setStatus(status);
        }

        return ResponseEntity.ok(attendanceRepository.save(attendance));
    }
}
