package com.medtrack.repository;

import com.medtrack.model.Prescription;
import com.medtrack.model.RefillRequest;
import com.medtrack.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefillRequestRepository extends MongoRepository<RefillRequest, String> {
    List<RefillRequest> findByPatientOrderByCreatedAtDesc(User patient);

    List<RefillRequest> findByPharmacistOrderByCreatedAtDesc(User pharmacist);

    List<RefillRequest> findByStatusOrderByCreatedAtDesc(RefillRequest.RefillStatus status);

    boolean existsByPrescriptionAndStatusIn(Prescription prescription, List<RefillRequest.RefillStatus> statuses);
}
