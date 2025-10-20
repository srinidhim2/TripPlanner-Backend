FROM debezium/connect:2.2

# Install tools needed to download/unzip connector (support multiple base OSes)
USER root
RUN set -eux; \
    if command -v apt-get >/dev/null 2>&1; then \
      apt-get update && apt-get install -y curl unzip ca-certificates && rm -rf /var/lib/apt/lists/*; \
    elif command -v microdnf >/dev/null 2>&1; then \
      microdnf install -y curl unzip ca-certificates || true; \
    elif command -v yum >/dev/null 2>&1; then \
      yum install -y curl unzip ca-certificates || true; \
    elif command -v apk >/dev/null 2>&1; then \
      apk add --no-cache curl unzip ca-certificates || true; \
    else \
      echo "No known package manager found in base image; continuing without installing helper tools"; \
    fi

ARG OPENSEARCH_CONNECTOR_VERSION=2.8.0
RUN mkdir -p /kafka/connect/opensearch

# Download and unzip the OpenSearch connector into the Connect plugin path
RUN set -eux; \
    curl -L -o /tmp/opensearch-connector.zip "https://github.com/opensearch-project/kafka-connect-opensearch/releases/download/v${OPENSEARCH_CONNECTOR_VERSION}/kafka-connect-opensearch-${OPENSEARCH_CONNECTOR_VERSION}.zip" || true; \
    if [ -f /tmp/opensearch-connector.zip ]; then \
      unzip -o /tmp/opensearch-connector.zip -d /kafka/connect/opensearch; \
      rm /tmp/opensearch-connector.zip; \
    else \
      echo "Warning: opensearch connector zip not downloaded during build. You can mount ./connect-plugins into /kafka/connect at runtime or rebuild with network access."; \
    fi

# Revert to the default user used by the base image
USER 1000
