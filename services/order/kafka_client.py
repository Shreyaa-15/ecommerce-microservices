import os
import json
import logging
from kafka import KafkaProducer
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
            logger.warning("Kafka not available — events will not be published")
    return _producer

def publish_event(topic: str, event: dict):
    producer = get_producer()
    if producer:
        try:
            producer.send(topic, event)
            producer.flush()
            logger.info(f"Published to {topic}: {event}")
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")