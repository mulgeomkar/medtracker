package com.medtrack.repository;

import com.medtrack.model.Prescription;
import com.medtrack.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {
    List<Prescription> findByPatient(User patient);
    List<Prescription> findByDoctor(User doctor);
    List<Prescription> findByStatus(Prescription.PrescriptionStatus status);
}
