package com.hms.servicename.controller;

import com.hms.lib.common.context.TenantContext;
import com.hms.lib.common.context.UserContext;
import com.hms.servicename.model.OnboardingRequestEntity;
import com.hms.servicename.repository.OnboardingRequestRepository;
import com.hms.workflow.api.OnboardingApi;
import com.hms.workflow.model.OnboardingResponse;
import com.hms.workflow.model.StartOnboardingRequest;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class OnboardingController implements OnboardingApi {

    private final OnboardingRequestRepository repository;

    public OnboardingController(OnboardingRequestRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public ResponseEntity<OnboardingResponse> startOnboarding(StartOnboardingRequest request) {
        // 1. Save state to DB (Transactional)
        OnboardingRequestEntity entity = new OnboardingRequestEntity();
        entity.setTenantName(request.getTenantName());
        entity.setAdminEmail(request.getAdminEmail());
        entity.setStatus("PENDING");
        entity = repository.save(entity);

        // 2. Start the Process
        // When Flowable is integrated, use this pattern to inject context:
        // 
        // Map<String, Object> processVariables = new HashMap<>();
        // processVariables.put("tenantName", request.getTenantName());
        // processVariables.put("adminEmail", request.getAdminEmail());
        // 
        // // CRITICAL: Inject context for Flowable async tasks
        // String tenantId = TenantContext.getTenantId();
        // String userId = UserContext.getUserId();
        // String orgId = UserContext.getOrgId();
        // String traceId = MDC.get("traceId");
        // 
        // if (tenantId != null) {
        //     processVariables.put("_hms_initiator_tenant", tenantId);
        // }
        // if (userId != null) {
        //     processVariables.put("_hms_initiator_user", userId);
        // }
        // if (orgId != null) {
        //     processVariables.put("_hms_initiator_org", orgId);
        // }
        // if (traceId != null) {
        //     processVariables.put("_hms_trace_id", traceId);
        // }
        // 
        // ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
        //     "onboardingProcess", 
        //     processVariables
        // );
        // String processId = processInstance.getId();
        
        // For now, use a mock process ID until Flowable is integrated
        String processId = UUID.randomUUID().toString();
        entity.setProcessInstanceId(processId);
        repository.save(entity);

        // 3. Return Response
        OnboardingResponse response = new OnboardingResponse();
        response.setProcessId(UUID.fromString(processId));
        response.setStatus(OnboardingResponse.StatusEnum.PENDING);

        return ResponseEntity.accepted().body(response);
    }
}
