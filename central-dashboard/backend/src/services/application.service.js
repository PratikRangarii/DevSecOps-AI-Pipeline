import { getDeploymentSummary } from "./deployment.service.js";

const FRONTEND_URL =
  process.env.WANDERLUST_FRONTEND_URL ||
  "http://localhost:3000";

const BACKEND_URL =
  process.env.WANDERLUST_BACKEND_URL ||
  "http://localhost:5000";

const BACKEND_HEALTH_PATH =
  process.env.WANDERLUST_BACKEND_HEALTH_PATH ||
  "/api/health";

const REQUEST_TIMEOUT = Number(
  process.env.APPLICATION_HEALTH_TIMEOUT || 5000
);

const normalizeBaseUrl = (url) =>
  String(url || "").replace(/\/+$/, "");

const buildUrl = (baseUrl, path = "") => {
  const normalizedBase = normalizeBaseUrl(baseUrl);

  if (!path) {
    return normalizedBase;
  }

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

const probeHttpService = async ({
  name,
  url,
  successStatusCodes = [],
}) => {
  const startedAt = Date.now();
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/html;q=0.9,*/*;q=0.8",
        "User-Agent": "DevSecOps-Control-Center/1.0",
      },
    });

    const responseTime = Date.now() - startedAt;

    const successful =
      response.ok ||
      successStatusCodes.includes(response.status);

    let responseBody = null;

    const contentType =
      response.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        const text = await response.text();

        responseBody = text.slice(0, 500);
      }
    } catch {
      responseBody = null;
    }

    return {
      name,
      status: successful ? "UP" : "DEGRADED",
      available: successful,
      url,
      statusCode: response.status,
      statusText: response.statusText,
      responseTime,
      checkedAt: new Date().toISOString(),
      error: successful
        ? null
        : `Application returned HTTP ${response.status}`,
      response: responseBody,
    };
  } catch (error) {
    const responseTime = Date.now() - startedAt;

    const timedOut =
      error.name === "AbortError";

    return {
      name,
      status: "DOWN",
      available: false,
      url,
      statusCode: null,
      statusText: null,
      responseTime,
      checkedAt: new Date().toISOString(),
      error: timedOut
        ? `Request timed out after ${REQUEST_TIMEOUT}ms`
        : error.message,
      response: null,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

const findContainer = (
  containers,
  possibleServices = []
) => {
  const normalizedServices = possibleServices.map(
    (service) => service.toLowerCase()
  );

  return containers.find((container) => {
    const name = String(
      container.name || ""
    ).toLowerCase();

    const service = String(
      container.compose?.service || ""
    ).toLowerCase();

    return (
      normalizedServices.includes(name) ||
      normalizedServices.includes(service)
    );
  });
};

const mapContainerStatus = (container) => {
  if (!container) {
    return {
      found: false,
      running: false,
      state: "not-found",
      health: "unknown",
      containerName: null,
      image: null,
      uptime: null,
      restartCount: 0,
    };
  }

  return {
    found: true,
    running: container.running,
    state: container.state,
    health: container.health,
    containerName: container.name,
    image: container.image,
    uptime: container.uptime,
    restartCount: container.restartCount,
    exitCode: container.exitCode,
    ports: container.ports || [],
  };
};

const getMongoStatus = (container) => {
  if (!container) {
    return {
      status: "UNKNOWN",
      connected: false,
      message: "MongoDB container was not found.",
      container: mapContainerStatus(null),
    };
  }

  if (!container.running) {
    return {
      status: "DOWN",
      connected: false,
      message: "MongoDB container is stopped.",
      container: mapContainerStatus(container),
    };
  }

  if (container.health === "unhealthy") {
    return {
      status: "UNHEALTHY",
      connected: false,
      message:
        "MongoDB container is running but unhealthy.",
      container: mapContainerStatus(container),
    };
  }

  return {
    status: "UP",
    connected: true,
    message: "MongoDB container is running.",
    container: mapContainerStatus(container),
  };
};

const calculateOverallStatus = ({
  frontend,
  backend,
  mongodb,
}) => {
  const services = [
    frontend.available,
    backend.available,
    mongodb.connected,
  ];

  const availableServices = services.filter(
    Boolean
  ).length;

  if (availableServices === services.length) {
    return "HEALTHY";
  }

  if (availableServices === 0) {
    return "DOWN";
  }

  return "DEGRADED";
};

export const getApplicationSummary = async () => {
  const frontendProbeUrl =
    normalizeBaseUrl(FRONTEND_URL);

  const backendProbeUrl = buildUrl(
    BACKEND_URL,
    BACKEND_HEALTH_PATH
  );

  const [
    frontendProbe,
    backendProbe,
    deploymentData,
  ] = await Promise.all([
    probeHttpService({
      name: "Wanderlust Frontend",
      url: frontendProbeUrl,
    }),

    probeHttpService({
      name: "Wanderlust Backend",
      url: backendProbeUrl,
    }),

    getDeploymentSummary(),
  ]);

  const containers =
    deploymentData.containers || [];

  const frontendContainer = findContainer(
    containers,
    ["frontend", "wanderlust-frontend"]
  );

  const backendContainer = findContainer(
    containers,
    ["backend", "wanderlust-backend"]
  );

  const mongoContainer = findContainer(
    containers,
    ["mongodb", "mongo"]
  );

  const frontend = {
    ...frontendProbe,
    type: "frontend",
    applicationUrl: normalizeBaseUrl(
      FRONTEND_URL
    ),
    container: mapContainerStatus(
      frontendContainer
    ),
  };

  const backend = {
    ...backendProbe,
    type: "backend",
    baseUrl: normalizeBaseUrl(BACKEND_URL),
    healthPath: BACKEND_HEALTH_PATH,
    container: mapContainerStatus(
      backendContainer
    ),
  };

  const mongodb =
    getMongoStatus(mongoContainer);

  const overallStatus =
    calculateOverallStatus({
      frontend,
      backend,
      mongodb,
    });

  return {
    overallStatus,
    environment:
      process.env.DEPLOYMENT_ENVIRONMENT ||
      "local",
    generatedAt: new Date().toISOString(),

    summary: {
      totalServices: 3,
      availableServices: [
        frontend.available,
        backend.available,
        mongodb.connected,
      ].filter(Boolean).length,
      unavailableServices: [
        frontend.available,
        backend.available,
        mongodb.connected,
      ].filter((value) => !value).length,
    },

    frontend,
    backend,
    mongodb,
  };
};
