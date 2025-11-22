package com.hms.lib.common.context;

public class UserContext {
    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_ORG = new ThreadLocal<>();

    public static void setUserId(String userId) {
        CURRENT_USER.set(userId);
    }

    public static String getUserId() {
        return CURRENT_USER.get();
    }

    public static void setOrgId(String orgId) {
        CURRENT_ORG.set(orgId);
    }

    public static String getOrgId() {
        return CURRENT_ORG.get();
    }

    public static void clear() {
        CURRENT_USER.remove();
        CURRENT_ORG.remove();
    }
}
