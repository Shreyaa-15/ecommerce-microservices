import os
import json
import logging
import threading
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable

logger = logging.getLogger(__name__)
KAFKA_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

_producer = None

def get_producer():
    global _producer
    if _producer is None:
        try:
            _producer = KafkaProducer(
                bootstrap_servers=KAFKA_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                retries=3
            )
        except NoBrokersAvailable:
            logger.warning("Kafka producer not available")
    return _producer

def publish_event(topic: str, event: dict):
    producer = get_producer()
    if producer:
        try:
            producer.send(topic, event)
            producer.flush()
        except Exception as e:
            logger.error(f"Failed to publish: {e}")

def start_consumer(handler):
    """
    Start Kafka consumer in background thread.
    Listens to order.created and processes payments.
    This is the event-driven part — payment service
    reacts to orders without direct coupling.
    """
    def consume():
        try:
            consumer = KafkaConsumer(
                "order.created",
                bootstrap_servers=KAFKA_SERVERS,
                group_id="payment-service",
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                auto_offset_reset="earliest",
                enable_auto_commit=True
            )
            logger.info("Kafka consumer started — listening to order.created")
            for message in consumer:
                try:
                    handler(message.value)
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
        except NoBrokersAvailable:
            logger.warning("Kafka not available — consumer not started")
        except Exception as e:
            logger.error(f"Consumer error: {e}")

    thread = threading.Thread(target=consume, daemon=True)
    thread.start()