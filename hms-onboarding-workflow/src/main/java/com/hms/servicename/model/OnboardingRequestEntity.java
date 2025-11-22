package com.hms.servicename.model;

import com.hms.lib.common.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "onboarding_requests")
@Getter
@Setter
public class OnboardingRequestEntity extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "tenant_name", nullable = false)
    private String tenantName;
    
    @Column(name = "admin_email", nullable = false)
    private String adminEmail;
    
    @Column(name = "status", nullable = false)
    private String status; // PENDING, COMPLETED, FAILED
    
    @Column(name = "process_instance_id")
    private String processInstanceId;
}

