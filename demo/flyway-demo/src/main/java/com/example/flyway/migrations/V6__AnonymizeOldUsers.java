package com.example.flyway.migrations;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Java Migration: Anonymize old user data
 * 
 * Pattern: Java-Based Migrations with Explicit Transaction Management
 * Best Practice: Use Java migrations for conditional logic based on data state
 * 
 * This migration demonstrates:
 * - Explicit transaction boundaries
 * - Rollback handling
 * - Conditional logic based on data state
 * - Proper error handling
 */
public class V6__AnonymizeOldUsers extends BaseJavaMigration {
    
    private static final Logger logger = LoggerFactory.getLogger(V6__AnonymizeOldUsers.class);
    
    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        
        // Explicit transaction management
        boolean originalAutoCommit = connection.getAutoCommit();
        connection.setAutoCommit(false);
        
        try {
            // Check if there are old users to anonymize
            int oldUserCount = countOldUsers(connection);
            
            if (oldUserCount > 0) {
                logger.info("Found {} old users to anonymize", oldUserCount);
                
                // Anonymize users created before 2020-01-01
                int anonymized = anonymizeOldUsers(connection);
                
                connection.commit();
                logger.info("Successfully anonymized {} user records", anonymized);
            } else {
                logger.info("No old users found to anonymize");
                connection.commit();
            }
        } catch (Exception e) {
            connection.rollback();
            logger.error("Failed to anonymize old users", e);
            throw e;
        } finally {
            connection.setAutoCommit(originalAutoCommit);
        }
    }
    
    private int countOldUsers(Connection connection) throws SQLException {
        String sql = "SELECT COUNT(*) FROM users WHERE created_at < ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setDate(1, java.sql.Date.valueOf("2020-01-01"));
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }
    
    private int anonymizeOldUsers(Connection connection) throws SQLException {
        String sql = "UPDATE users SET email = 'anonymized_' || id || '@example.com', " +
                     "first_name = 'Anonymized', last_name = 'User', phone = NULL " +
                     "WHERE created_at < ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setDate(1, java.sql.Date.valueOf("2020-01-01"));
            return stmt.executeUpdate();
        }
    }
}

