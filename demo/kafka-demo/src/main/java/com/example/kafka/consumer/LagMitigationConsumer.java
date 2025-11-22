package com.example.kafka.consumer;

import com.example.kafka.config.ConsumerConfigFactory;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Collections;
import java.util.Properties;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Function;

/**
 * Kafka consumer with lag mitigation using internal queue workaround.
 * 
 * Pattern: Internal Queue Workaround for Slow Processing
 * - Kafka consumer quickly polls and commits offsets (preventing lag accumulation)
 * - Transfers records to internal queue for isolated, slower processing
 * - Avoids bottlenecking other messages waiting in Kafka topic
 * 
 * Best Practices Applied:
 * - Fast poll and commit (prevents lag accumulation)
 * - Internal queue for slow processing isolation
 * - Separate threads for consumption and processing
 * 
 * Anti-Patterns Avoided:
 * - ❌ Blocking Kafka consumer thread with slow operations (prevents offset commits, increases lag)
 * - ❌ Assuming lag is always a Kafka configuration issue (often indicates downstream processing bottlenecks)
 * 
 * Use Case: When downstream processing is slow (e.g., synchronous external API calls, slow database queries)
 */
public class LagMitigationConsumer<K, V> {
    
    private static final Logger logger = LoggerFactory.getLogger(LagMitigationConsumer.class);
    
    private final KafkaConsumer<K, V> consumer;
    private final String topic;
    private final BlockingQueue<ConsumerRecord<K, V>> internalQueue;
    private final Function<ConsumerRecord<K, V>, Boolean> slowProcessor;
    private final Thread consumerThread;
    private final Thread processorThread;
    private volatile boolean running = false;
    
    /**
     * Creates a consumer with lag mitigation using internal queue.
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints
     * @param groupId Consumer group ID
     * @param schemaRegistryUrl Schema Registry URL (null if not using Schema Registry)
     * @param topic Topic name to consume from
     * @param useAvro Whether to use Avro deserialization
     * @param slowProcessor Function for slow processing (e.g., synchronous external API calls)
     * @param queueCapacity Capacity of internal queue (use appropriate size based on memory constraints)
     */
    public LagMitigationConsumer(
            String bootstrapServers,
            String groupId,
            String schemaRegistryUrl,
            String topic,
            boolean useAvro,
            Function<ConsumerRecord<K, V>, Boolean> slowProcessor,
            int queueCapacity) {
        
        Properties props;
        if (useAvro && schemaRegistryUrl != null) {
            props = ConsumerConfigFactory.createAvroConsumerConfig(bootstrapServers, groupId, schemaRegistryUrl);
        } else {
            props = ConsumerConfigFactory.createStringConsumerConfig(bootstrapServers, groupId);
        }
        
        this.consumer = new KafkaConsumer<>(props);
        this.topic = topic;
        this.slowProcessor = slowProcessor;
        this.internalQueue = new LinkedBlockingQueue<>(queueCapacity);
        
        consumer.subscribe(Collections.singletonList(topic));
        
        // Consumer thread: Fast poll and commit
        this.consumerThread = new Thread(this::consumeLoop, "kafka-consumer-thread");
        consumerThread.setDaemon(false);
        
        // Processing thread: Slow processing from internal queue
        this.processorThread = new Thread(this::processLoop, "kafka-processor-thread");
        processorThread.setDaemon(false);
        
        logger.info("Initialized lag mitigation consumer for topic: {}, group: {}", topic, groupId);
        logger.info("Internal queue capacity: {}", queueCapacity);
    }
    
    /**
     * Consumer thread: Fast poll and commit, transfer to internal queue.
     * This thread quickly polls Kafka, commits offsets immediately, and transfers records
     * to internal queue. This prevents lag accumulation even when processing is slow.
     */
    private void consumeLoop() {
        logger.info("Consumer thread started for topic: {}", topic);
        
        try {
            while (running) {
                // Fast poll (non-blocking)
                ConsumerRecords<K, V> records = consumer.poll(Duration.ofMillis(100));
                
                if (records.isEmpty()) {
                    continue;
                }
                
                logger.debug("Polled {} records from topic: {}", records.count(), topic);
                
                // Transfer records to internal queue
                for (ConsumerRecord<K, V> record : records) {
                    try {
                        // Block if queue is full (backpressure)
                        internalQueue.put(record);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        logger.warn("Interrupted while adding record to queue", e);
                        return;
                    }
                }
                
                // Commit immediately after transferring to queue (prevents lag accumulation)
                // Anti-Pattern Avoided: ❌ Blocking consumer thread with slow operations
                try {
                    consumer.commitAsync();
                    logger.debug("Committed offsets immediately after queue transfer");
                } catch (Exception e) {
                    logger.error("Error committing offsets", e);
                }
            }
        } catch (Exception e) {
            logger.error("Fatal error in consumer loop", e);
        } finally {
            logger.info("Consumer thread stopped");
        }
    }
    
    /**
     * Processing thread: Slow processing from internal queue.
     * This thread processes records from the internal queue at its own pace.
     * Slow operations (e.g., synchronous external API calls) don't block Kafka consumer.
     */
    private void processLoop() {
        logger.info("Processor thread started for topic: {}", topic);
        
        try {
            while (running || !internalQueue.isEmpty()) {
                try {
                    // Take record from queue (blocks if queue is empty)
                    ConsumerRecord<K, V> record = internalQueue.take();
                    
                    // Slow processing (e.g., synchronous external API call, slow database query)
                    boolean success = slowProcessor.apply(record);
                    
                    if (success) {
                        logger.debug("Successfully processed record: topic={}, partition={}, offset={}, key={}",
                            record.topic(), record.partition(), record.offset(), record.key());
                    } else {
                        logger.warn("Record processing returned false: topic={}, partition={}, offset={}, key={}",
                            record.topic(), record.partition(), record.offset(), record.key());
                        // Note: Record already committed, so it won't be reprocessed
                        // Consider implementing Dead Letter Queue (DLQ) for failed records
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    logger.warn("Interrupted while processing record", e);
                    return;
                } catch (Exception e) {
                    logger.error("Error processing record from queue", e);
                    // Continue processing other records
                }
            }
        } catch (Exception e) {
            logger.error("Fatal error in processor loop", e);
        } finally {
            logger.info("Processor thread stopped");
        }
    }
    
    /**
     * Starts consuming and processing. Launches both consumer and processor threads.
     */
    public void start() {
        if (running) {
            logger.warn("Consumer already running");
            return;
        }
        
        running = true;
        consumerThread.start();
        processorThread.start();
        
        logger.info("Started lag mitigation consumer for topic: {}", topic);
    }
    
    /**
     * Stops consuming and processing. Waits for threads to finish.
     * 
     * @param timeoutMs Maximum time to wait for threads to finish (milliseconds)
     */
    public void stop(long timeoutMs) {
        if (!running) {
            return;
        }
        
        logger.info("Stopping lag mitigation consumer...");
        running = false;
        
        // Interrupt consumer thread (will stop polling)
        consumerThread.interrupt();
        
        // Wait for consumer thread
        try {
            consumerThread.join(timeoutMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Interrupted while waiting for consumer thread", e);
        }
        
        // Wait for processor thread (will process remaining queue items)
        try {
            processorThread.join(timeoutMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Interrupted while waiting for processor thread", e);
        }
        
        consumer.close();
        logger.info("Stopped lag mitigation consumer");
    }
    
    /**
     * Gets current queue size (for monitoring).
     * 
     * @return Current number of records in internal queue
     */
    public int getQueueSize() {
        return internalQueue.size();
    }
}


