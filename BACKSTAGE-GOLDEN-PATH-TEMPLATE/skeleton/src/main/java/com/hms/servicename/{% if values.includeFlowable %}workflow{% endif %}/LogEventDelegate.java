package com.hms.servicename.workflow;

import com.hms.lib.common.context.TenantContext;
import com.hms.lib.common.workflow.HmsJavaDelegate;
import org.flowable.engine.delegate.DelegateExecution;
import org.springframework.stereotype.Component;
import java.util.logging.Logger;

@Component("logTask") // Bean name must match the flowable:class in the XML
public class LogEventDelegate extends HmsJavaDelegate {

    private final Logger LOGGER = Logger.getLogger(LogEventDelegate.class.getName());

    @Override
    protected void executeLogic(DelegateExecution execution) {
        // Context is already restored here (TenantContext, UserContext, MDC)
        LOGGER.info("WORKFLOW EXECUTED!");
        LOGGER.info("Process Instance ID: " + execution.getProcessInstanceId());
        LOGGER.info("Tenant ID: " + TenantContext.getTenantId()); // Context is available!
        
        // You can get variables from the Kafka event here
        // e.g., String customerId = (String) execution.getVariable("customerId");
    }
}

