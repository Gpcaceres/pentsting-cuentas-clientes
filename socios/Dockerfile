# Dockerfile para Spring Boot Microservicio Socios
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copiar archivos de configuración Maven
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Dar permisos de ejecución a mvnw
RUN chmod +x mvnw

# Descargar dependencias
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente
COPY src ./src

# Build de la aplicación
RUN ./mvnw clean package -DskipTests

# Etapa 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar JAR desde etapa de build
COPY --from=build /app/target/*.jar app.jar

# Exponer puerto
EXPOSE 8080

# Variables de entorno por defecto
ENV SPRING_PROFILES_ACTIVE=prod
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_NAME=cooperativa_socios
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=postgres

# Comando de inicio
ENTRYPOINT ["java", "-jar", "app.jar"]
