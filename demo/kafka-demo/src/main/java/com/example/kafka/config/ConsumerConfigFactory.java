package com.example.kafka.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.util.Properties;

/**
 * Factory for creating production-ready Kafka consumer configurations.
 * Implements manual offset control pattern:
 * - enable.auto.commit=false (manual offset control)
 * - Commit offsets only after successful processing
 * - Consumer count <= partition count (1:1 ratio for maximum parallelism)
 * 
 * Follows patterns from implementing-kafka-production skill document.
 */
public class ConsumerConfigFactory {

    /**
     * Creates a reliable consumer configuration with manual offset control.
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints (e.g., "kafka-broker1:9092")
     * @param groupId Consumer group ID
     * @return Configured Properties for KafkaConsumer
     */
    public static Properties createReliableConsumerConfig(String bootstrapServers, String groupId) {
        Properties props = new Properties();
        
        // Basic Configuration
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        
        // Manual Offset Control (MANDATORY for critical data)
        // Best Practice: Manual offset control is essential for guaranteed delivery
        // Anti-Pattern Avoided: ❌ Auto-commit enabled (risks data loss on consumer failure)
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        
        // Deserializers
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        
        // Offset Reset (when no committed offset exists)
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        // Session and Heartbeat Configuration
        props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000); // 30 seconds
        props.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 3000); // 3 seconds
        
        // Fetch Configuration
        props.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1); // Return immediately if data available
        props.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500); // Max wait time for fetch
        
        // Max Poll Records (control batch size)
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500); // Process up to 500 records per poll
        
        return props;
    }

    /**
     * Creates a consumer configuration for Avro deserialization with Schema Registry.
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints
     * @param groupId Consumer group ID
     * @param schemaRegistryUrl Schema Registry URL
     * @return Configured Properties for KafkaConsumer with Avro deserializer
     */
    public static Properties createAvroConsumerConfig(String bootstrapServers, String groupId, String schemaRegistryUrl) {
        Properties props = createReliableConsumerConfig(bootstrapServers, groupId);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, "io.confluent.kafka.serializers.KafkaAvroDeserializer");
        props.put("schema.registry.url", schemaRegistryUrl);
        return props;
    }

    /**
     * Creates a consumer configuration for String deserialization (no Schema Registry).
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints
     * @param groupId Consumer group ID
     * @return Configured Properties for KafkaConsumer with String deserializer
     */
    public static Properties createStringConsumerConfig(String bootstrapServers, String groupId) {
        Properties props = createReliableConsumerConfig(bootstrapServers, groupId);
        // String deserializers are already set in createReliableConsumerConfig
        return props;
    }
}

