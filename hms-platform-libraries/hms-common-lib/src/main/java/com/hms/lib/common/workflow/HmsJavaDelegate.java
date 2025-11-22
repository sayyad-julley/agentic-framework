package com.hms.lib.common.workflow;

import com.hms.lib.common.context.TenantContext;
import com.hms.lib.common.context.UserContext;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.MDC;

/**
 * Base class for Flowable JavaDelegate implementations that automatically
 * restores context from process variables.
 * 
 * When Flowable executes a Timer Event or Async Service Task, it might happen
 * hours later on a different server. ThreadLocal snapshotting (TaskDecorator)
 * is not sufficient because the original thread is long dead.
 * 
 * Solution: Persist context into Process Variables when starting the process,
 * then restore it in this base class before executing the delegate logic.
 * 
 * Usage:
 * <pre>
 * public class MyDelegate extends HmsJavaDelegate {
 *     {@literal @}Override
 *     protected void executeLogic(DelegateExecution execution) {
 *         // Context is already restored here
 *         String tenantId = TenantContext.getTenantId(); // Available!
 *         // Your business logic...
 *     }
 * }
 * </pre>
 * 
 * Process Variable Injection (when starting process):
 * <pre>
 * Map&lt;String, Object&gt; vars = new HashMap&lt;&gt;();
 * vars.put("_hms_initiator_tenant", TenantContext.getTenantId());
 * vars.put("_hms_initiator_user", UserContext.getUserId());
 * vars.put("_hms_trace_id", MDC.get("traceId"));
 * runtimeService.startProcessInstanceByKey("processKey", vars);
 * </pre>
 */
public abstract class HmsJavaDelegate implements JavaDelegate {

    /**
     * Flowable's execute method. Extracts context from process variables
     * and restores it to ThreadLocal before calling the abstract executeLogic method.
     * 
     * @param execution The Flowable execution context
     */
    @Override
    public final void execute(DelegateExecution execution) {
        // Extract context from process variables
        String tenantId = (String) execution.getVariable("_hms_initiator_tenant");
        String userId = (String) execution.getVariable("_hms_initiator_user");
        String orgId = (String) execution.getVariable("_hms_initiator_org");
        String traceId = (String) execution.getVariable("_hms_trace_id");

        try {
            // Restore context to ThreadLocal
            if (tenantId != null && !tenantId.isBlank()) {
                TenantContext.setTenantId(tenantId);
            }
            if (userId != null && !userId.isBlank()) {
                UserContext.setUserId(userId);
            }
            if (orgId != null && !orgId.isBlank()) {
                UserContext.setOrgId(orgId);
            }
            if (traceId != null && !traceId.isBlank()) {
                MDC.put("traceId", traceId);
            }

            // Execute the actual business logic
            executeLogic(execution);
        } finally {
            // Always clean up context after execution
            TenantContext.clear();
            UserContext.clear();
            MDC.clear();
        }
    }

    /**
     * Abstract method that subclasses must implement with their business logic.
     * Context (TenantContext, UserContext, MDC) is already restored when this method is called.
     * 
     * @param execution The Flowable execution context
     */
    protected abstract void executeLogic(DelegateExecution execution);
}

