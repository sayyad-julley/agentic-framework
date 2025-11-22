package com.example.kafka.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;

/**
 * Factory for creating production-ready Kafka producer configurations.
 * Implements three-layer durability pattern:
 * 1. Producer: acks=all (waits for all ISR)
 * 2. Topic: replication.factor >= 3
 * 3. Broker: min.insync.replicas >= 2
 * 
 * Follows patterns from implementing-kafka-production skill document.
 */
public class ProducerConfigFactory {

    /**
     * Creates a reliable producer configuration with three-layer durability.
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints (e.g., "kafka-broker1:9092,kafka-broker2:9092")
     * @param schemaRegistryUrl Schema Registry URL (e.g., "http://schema-registry:8081")
     * @return Configured Properties for KafkaProducer
     */
    public static Properties createReliableProducerConfig(String bootstrapServers, String schemaRegistryUrl) {
        Properties props = new Properties();
        
        // Basic Configuration
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "io.confluent.kafka.serializers.json.KafkaJsonSerializer");
        
        // Schema Registry (if using Avro/JSON with Schema Registry)
        if (schemaRegistryUrl != null && !schemaRegistryUrl.isEmpty()) {
            props.put("schema.registry.url", schemaRegistryUrl);
        }
        
        // Three-Layer Durability Configuration (MANDATORY for critical data)
        // Layer 1: Producer - Wait for all In-Sync Replicas
        props.put(ProducerConfig.ACKS_CONFIG, "all"); // or "-1"
        props.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE); // Aggressive retries
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true"); // Prevent duplicates during retries
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5); // Required for idempotence
        
        // Performance Configuration
        props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4"); // Network efficiency
        props.put(ProducerConfig.LINGER_MS_CONFIG, 10); // Batch optimization (10ms)
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 32768); // 32KB batches
        
        // Timeout Configuration
        props.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000); // 30 seconds
        props.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 120000); // 2 minutes
        
        return props;
    }

    /**
     * Creates a producer configuration for Avro serialization with Schema Registry.
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints
     * @param schemaRegistryUrl Schema Registry URL
     * @return Configured Properties for KafkaProducer with Avro serializer
     */
    public static Properties createAvroProducerConfig(String bootstrapServers, String schemaRegistryUrl) {
        Properties props = createReliableProducerConfig(bootstrapServers, schemaRegistryUrl);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "io.confluent.kafka.serializers.KafkaAvroSerializer");
        return props;
    }

    /**
     * Creates a producer configuration for String serialization (no Schema Registry).
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints
     * @return Configured Properties for KafkaProducer with String serializer
     */
    public static Properties createStringProducerConfig(String bootstrapServers) {
        Properties props = createReliableProducerConfig(bootstrapServers, null);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        if (props.containsKey("schema.registry.url")) {
            props.remove("schema.registry.url"); // Not needed for String serialization
        }
        return props;
    }
}

