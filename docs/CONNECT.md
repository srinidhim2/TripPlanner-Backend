Installing OpenSearch Sink Connector for Kafka Connect

Overview

Your current Kafka Connect image (debezium/connect:2.2) doesn't include the OpenSearch sink connector. To enable it, place the OpenSearch connector plugin (a folder with the connector JARs) under the host folder `./connect-plugins` which is mounted into the container at `/kafka/connect`.

Steps

1. Create the plugin directory on the host:

   mkdir -p ./connect-plugins/opensearch-connector

2. Download the OpenSearch sink connector distribution (choose a version compatible with your Connect version). For example (adjust version as needed):

   # Example (run on host):
   curl -L -o opensearch-connector.zip "https://github.com/opensearch-project/kafka-connect-opensearch/releases/download/v2.8.0/kafka-connect-opensearch-2.8.0.zip"
   unzip opensearch-connector.zip -d ./connect-plugins/opensearch-connector

3. Restart Kafka Connect so it picks up the new plugin:

   docker compose up -d --build connect

4. Verify the plugin is available using the Connect REST API:

   curl http://localhost:8083/connector-plugins | jq '.'

5. Create the connector using the JSON in `docs/opensearch-sink-connector.json` (adjust `connection.url` to `http://opensearch:9200` if Connect runs in the same Docker network):

   curl -X POST http://localhost:8083/connectors \
     -H "Content-Type: application/json" \
     -d @docs/opensearch-sink-connector.json

Notes

- If you prefer not to mount plugins from the host, build a custom Docker image that adds the OpenSearch connector plugin into `/kafka/connect` during image build.
- Make sure connector versions are compatible with the Connect runtime (Debezium Connect 2.2 / Kafka Connect 3.x compatible connectors). If you see class not found errors, check the plugin's README for the supported Connect versions.
