package com.medtrack.repository;

import com.medtrack.model.Reminder;
import com.medtrack.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReminderRepository extends MongoRepository<Reminder, String> {
    List<Reminder> findByPatient(User patient);
    List<Reminder> findByPatientAndActiveTrue(User patient);
}
