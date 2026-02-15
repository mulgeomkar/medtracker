package com.medtrack.repository;

import com.medtrack.model.DoseLog;
import com.medtrack.model.Reminder;
import com.medtrack.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoseLogRepository extends MongoRepository<DoseLog, String> {
    List<DoseLog> findByPatient(User patient);

    List<DoseLog> findByPatientAndScheduledAtBetween(User patient, LocalDateTime start, LocalDateTime end);

    List<DoseLog> findByReminderAndScheduledAtBetween(Reminder reminder, LocalDateTime start, LocalDateTime end);
}
