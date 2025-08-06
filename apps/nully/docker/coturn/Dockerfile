# CoTURN TURN Server for Sliplane Deployment
FROM coturn/coturn:4.6.2

# Install additional utilities
USER root
RUN apt-get update && apt-get install -y \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /var/log/coturn /etc/coturn/certs
RUN chown -R nobody:nogroup /var/log/coturn

# Copy configuration files
COPY turnserver.conf /etc/coturn/turnserver.conf
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Make entrypoint executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose ports for TURN server
# Standard TURN ports
EXPOSE 3478/udp 3478/tcp
# TLS TURN ports  
EXPOSE 5349/udp 5349/tcp
# Alternative ports for firewall traversal
EXPOSE 80/tcp 443/tcp
# RTP relay ports range
EXPOSE 49160-49200/udp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD netstat -tuln | grep -E ':(3478|5349|80|443)\s' || exit 1

# Switch to non-root user for security
USER nobody

# Use custom entrypoint for dynamic configuration
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]