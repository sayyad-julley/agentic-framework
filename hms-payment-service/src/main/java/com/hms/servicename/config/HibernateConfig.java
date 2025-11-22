package com.hms.servicename.config;

import com.hms.servicename.tenancy.MultiTenantConnectionProvider;
import com.hms.servicename.tenancy.TenantIdentifierResolver;
import org.hibernate.cfg.AvailableSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class HibernateConfig {

    @Autowired
    private TenantIdentifierResolver tenantIdentifierResolver;

    @Autowired
    private MultiTenantConnectionProvider multiTenantConnectionProvider;

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return (Map<String, Object> hibernateProperties) -> {
            hibernateProperties.put("hibernate.multiTenancy", "SCHEMA");
            hibernateProperties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, tenantIdentifierResolver);
            hibernateProperties.put(AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER, multiTenantConnectionProvider);
        };
    }
}

