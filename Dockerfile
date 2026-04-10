# Use Java 17
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy ONLY backend folder
COPY backend /app

# Give permission to Maven wrapper
RUN chmod +x mvnw

# Build the project
RUN ./mvnw clean package -DskipTests

# Expose port (Render will override)
EXPOSE 8080

# Run the app
CMD ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]