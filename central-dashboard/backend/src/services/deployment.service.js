import Docker from "dockerode";

const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET || "/var/run/docker.sock",
});

const formatDuration = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return "Unknown";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const normalizePorts = (ports = []) =>
  ports.map((port) => ({
    privatePort: port.PrivatePort ?? null,
    publicPort: port.PublicPort ?? null,
    type: port.Type ?? "tcp",
    ip: port.IP ?? null,
    mapping: port.PublicPort
      ? `${port.IP || "0.0.0.0"}:${port.PublicPort}:${port.PrivatePort}`
      : `${port.PrivatePort}/${port.Type || "tcp"}`,
  }));

const getContainerName = (names = []) => {
  const firstName = names[0] || "unknown";

  return firstName.startsWith("/")
    ? firstName.slice(1)
    : firstName;
};

const getHealthStatus = (inspectData) =>
  inspectData?.State?.Health?.Status || "not-configured";

const getStartedAt = (inspectData) => {
  const startedAt = inspectData?.State?.StartedAt;

  if (!startedAt || startedAt.startsWith("0001-")) {
    return null;
  }

  const date = new Date(startedAt);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
};

const getUptime = (inspectData) => {
  if (!inspectData?.State?.Running) {
    return "Stopped";
  }

  const startedAt = getStartedAt(inspectData);

  if (!startedAt) {
    return "Unknown";
  }

  return formatDuration(
    Date.now() - new Date(startedAt).getTime()
  );
};

const getEnvironment = (labels = {}) =>
  labels["com.docker.compose.project.environment"] ||
  labels.environment ||
  labels.env ||
  process.env.DEPLOYMENT_ENVIRONMENT ||
  "local";

const isRelevantContainer = (container) => {
  const filter = String(
    process.env.DEPLOYMENT_CONTAINER_FILTER || ""
  )
    .trim()
    .toLowerCase();

  if (!filter) {
    return true;
  }

  const searchableText = [
    ...(container.Names || []),
    container.Image,
    container.Labels?.["com.docker.compose.project"],
    container.Labels?.["com.docker.compose.service"],
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(filter);
};

const mapContainer = async (containerInfo) => {
  const container = docker.getContainer(containerInfo.Id);
  const inspectData = await container.inspect();

  const labels = containerInfo.Labels || {};
  const state = inspectData.State || {};

  return {
    id: containerInfo.Id,
    shortId: containerInfo.Id.slice(0, 12),
    name: getContainerName(containerInfo.Names),
    image: containerInfo.Image,
    imageId: containerInfo.ImageID,
    command: containerInfo.Command,
    state: containerInfo.State,
    status: containerInfo.Status,
    running: Boolean(state.Running),
    paused: Boolean(state.Paused),
    restarting: Boolean(state.Restarting),
    dead: Boolean(state.Dead),
    exitCode: state.ExitCode ?? null,
    health: getHealthStatus(inspectData),
    restartCount: inspectData.RestartCount ?? 0,
    createdAt: containerInfo.Created
      ? new Date(containerInfo.Created * 1000).toISOString()
      : null,
    startedAt: getStartedAt(inspectData),
    uptime: getUptime(inspectData),
    ports: normalizePorts(containerInfo.Ports),
    networkMode:
      inspectData.HostConfig?.NetworkMode || "unknown",
    compose: {
      project:
        labels["com.docker.compose.project"] || null,
      service:
        labels["com.docker.compose.service"] || null,
      containerNumber:
        labels["com.docker.compose.container-number"] ||
        null,
      workingDirectory:
        labels[
          "com.docker.compose.project.working_dir"
        ] || null,
      configFiles:
        labels[
          "com.docker.compose.project.config_files"
        ] || null,
    },
    environment: getEnvironment(labels),
    labels,
  };
};

export const getDeploymentSummary = async () => {
  try {
    await docker.ping();

    const rawContainers = await docker.listContainers({
      all: true,
    });

    const relevantContainers =
      rawContainers.filter(isRelevantContainer);

    const containers = await Promise.all(
      relevantContainers.map(mapContainer)
    );

    containers.sort((a, b) => {
      if (a.running !== b.running) {
        return a.running ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

    const runningContainers = containers.filter(
      (container) => container.running
    );

    const stoppedContainers = containers.filter(
      (container) => !container.running
    );

    const healthyContainers = containers.filter(
      (container) => container.health === "healthy"
    );

    const unhealthyContainers = containers.filter(
      (container) => container.health === "unhealthy"
    );

    const restartingContainers = containers.filter(
      (container) => container.restarting
    );

    const uniqueImages = [
      ...new Set(
        containers
          .map((container) => container.image)
          .filter(Boolean)
      ),
    ];

    return {
      dockerConnected: true,
      environment:
        process.env.DEPLOYMENT_ENVIRONMENT || "local",
      generatedAt: new Date().toISOString(),
      summary: {
        totalContainers: containers.length,
        runningContainers: runningContainers.length,
        stoppedContainers: stoppedContainers.length,
        healthyContainers: healthyContainers.length,
        unhealthyContainers: unhealthyContainers.length,
        restartingContainers:
          restartingContainers.length,
        totalImages: uniqueImages.length,
      },
      images: uniqueImages,
      containers,
    };
  } catch (error) {
    if (error.code === "EACCES") {
      throw new Error(
        "Docker socket permission denied. Ensure the backend user belongs to the docker group."
      );
    }

    if (error.code === "ENOENT") {
      throw new Error(
        "Docker socket was not found at /var/run/docker.sock."
      );
    }

    throw new Error(
      error.message ||
        "Unable to retrieve Docker deployment information."
    );
  }
};
