package com.example.kafka.streams;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.Properties;

/**
 * Kafka Streams application demonstrating stateful stream processing.
 * 
 * Pattern: Kafka Streams (State Management)
 * - KStream models infinite, immutable event history
 * - KTable models changelog and current, mutable state
 * - Local, fault-tolerant state stores for materialized views
 * 
 * Best Practices Applied:
 * - Use Kafka Streams for implementing stateful Event Handler role in CQRS pattern
 * - Native handling of local, fault-tolerant state stores for materialized views
 * - Supports windowed joins and aggregations for real-time processing
 * 
 * Anti-Patterns Avoided:
 * - ❌ Not using Materialized views for CQRS read models (missing performance optimization)
 * - ❌ Ignoring state store fault tolerance (data loss risk)
 */
public class WordCountStreamsApp {
    
    private static final Logger logger = LoggerFactory.getLogger(WordCountStreamsApp.class);
    
    private final KafkaStreams streams;
    
    /**
     * Creates Kafka Streams application for word counting.
     * 
     * @param bootstrapServers Kafka broker endpoints
     * @param applicationId Application ID (must be unique per application instance)
     * @param inputTopic Input topic name
     * @param outputTopic Output topic name
     */
    public WordCountStreamsApp(String bootstrapServers, String applicationId, String inputTopic, String outputTopic) {
        Properties props = createStreamsConfig(bootstrapServers, applicationId);
        
        StreamsBuilder builder = new StreamsBuilder();
        
        // Input stream: Infinite, immutable event history
        KStream<String, String> textLines = builder.stream(inputTopic);
        
        // Transformations: flatten lines into words, group, count
        KTable<String, Long> wordCounts = textLines
            .flatMapValues(textLine -> Arrays.asList(textLine.toLowerCase().split("\\W+")))
            .groupBy((key, word) -> word, Grouped.as("word-group"))
            .count(Materialized.as("CountsStore")); // Persistence definition - fault-tolerant state store
        
        // Output changelog stream to new topic
        wordCounts.toStream().to(outputTopic);
        
        // Build topology
        this.streams = new KafkaStreams(builder.build(), props);
        
        logger.info("Initialized Kafka Streams application: applicationId={}, inputTopic={}, outputTopic={}", 
            applicationId, inputTopic, outputTopic);
    }
    
    /**
     * Creates Kafka Streams configuration.
     * 
     * @param bootstrapServers Kafka broker endpoints
     * @param applicationId Application ID
     * @return Configured Properties for KafkaStreams
     */
    private Properties createStreamsConfig(String bootstrapServers, String applicationId) {
        Properties props = new Properties();
        
        // Basic Configuration
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, applicationId);
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        
        // Default Serdes
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        
        // State Store Configuration
        props.put(StreamsConfig.STATE_DIR_CONFIG, "/tmp/kafka-streams/" + applicationId);
        
        // Replication Configuration (for broker version 2.8+)
        props.put(StreamsConfig.topicPrefix("min.insync.replicas"), 2);
        props.put(StreamsConfig.NUM_STANDBY_REPLICAS_CONFIG, 1); // Standby replicas for fault tolerance
        
        // Consumer Configuration
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        // Processing Guarantees
        props.put(StreamsConfig.PROCESSING_GUARANTEE_CONFIG, StreamsConfig.EXACTLY_ONCE_V2);
        
        return props;
    }
    
    /**
     * Starts the Kafka Streams application.
     */
    public void start() {
        // Set shutdown hook for graceful shutdown
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.info("Shutting down Kafka Streams application...");
            streams.close();
        }));
        
        streams.start();
        logger.info("Started Kafka Streams application");
    }
    
    /**
     * Stops the Kafka Streams application.
     */
    public void stop() {
        streams.close();
        logger.info("Stopped Kafka Streams application");
    }
    
    /**
     * Gets the current state of the streams application.
     * 
     * @return true if running, false otherwise
     */
    public boolean isRunning() {
        return streams.state() == KafkaStreams.State.RUNNING;
    }
}

