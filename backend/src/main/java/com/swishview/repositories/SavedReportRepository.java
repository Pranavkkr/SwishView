package com.swishview.repositories;

import com.swishview.entity.SavedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SavedReportRepository extends JpaRepository<SavedReport, Long> {
    List<SavedReport> findByGeneratedById(Long employeeId);
}
