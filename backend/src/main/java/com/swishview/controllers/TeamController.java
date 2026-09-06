package com.swishview.controllers;

import com.swishview.entity.Team;
import com.swishview.services.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @Autowired
    private com.swishview.repositories.EmployeeRepository employeeRepository;

    @GetMapping
    public List<Team> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        Team team = teamService.getTeamById(id);
        return team != null ? ResponseEntity.ok(team) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody Team team) {
        // Save the team first to generate its ID
        Team savedTeam = teamService.saveTeam(team);
        
        // Update employees if members were provided
        if (team.getMembers() != null && !team.getMembers().isEmpty()) {
            for (com.swishview.entity.Employee memberRef : team.getMembers()) {
                employeeRepository.findById(memberRef.getId()).ifPresent(emp -> {
                    emp.setTeam(savedTeam);
                    employeeRepository.save(emp);
                });
            }
        }
        
        // Refetch the team so it includes the properly mapped members
        Team fullTeam = teamService.getTeamById(savedTeam.getId());
        return ResponseEntity.ok(fullTeam);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }
}

