package com.hms.servicename.repository;

import com.hms.servicename.model.OnboardingRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OnboardingRequestRepository extends JpaRepository<OnboardingRequestEntity, UUID> {
}

