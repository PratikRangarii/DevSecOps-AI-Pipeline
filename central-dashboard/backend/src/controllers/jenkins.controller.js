import {
  getJobSummary,
  getLatestBuildDetails,
  getBuildHistory,
} from "../services/jenkins.service.js";

const formatDuration = (milliseconds = 0) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
};

export const getJenkinsSummary = async (req, res) => {
  try {
    const [job, latestBuild, builds] = await Promise.all([
      getJobSummary(),
      getLatestBuildDetails(),
      getBuildHistory(),
    ]);

    const completedBuilds = builds.filter(
      (build) => !build.building && build.result
    );

    const successfulBuilds = completedBuilds.filter(
      (build) => build.result === "SUCCESS"
    ).length;

    const failedBuilds = completedBuilds.filter(
      (build) => build.result === "FAILURE"
    ).length;

    const unstableBuilds = completedBuilds.filter(
      (build) => build.result === "UNSTABLE"
    ).length;

    const abortedBuilds = completedBuilds.filter(
      (build) => build.result === "ABORTED"
    ).length;

    const successRate =
      completedBuilds.length > 0
        ? Number(
            (
              (successfulBuilds / completedBuilds.length) *
              100
            ).toFixed(1)
          )
        : 0;

    const summary = {
      name: job.name,
      url: job.url,
      description: job.description ?? "",
      buildable: job.buildable,
      inQueue: job.inQueue,

      totalBuilds: builds.length,
      completedBuilds: completedBuilds.length,
      successfulBuilds,
      failedBuilds,
      unstableBuilds,
      abortedBuilds,
      successRate,

      latestBuild: {
        number: latestBuild.number,
        result: latestBuild.result ?? "BUILDING",
        building: latestBuild.building,
        durationMs: latestBuild.duration ?? 0,
        duration: formatDuration(latestBuild.duration),
        timestamp: latestBuild.timestamp,
        startedAt: latestBuild.timestamp
          ? new Date(latestBuild.timestamp).toISOString()
          : null,
        url: latestBuild.url,
      },

      lastSuccessfulBuild:
        job.lastSuccessfulBuild?.number ?? null,

      lastFailedBuild:
        job.lastFailedBuild?.number ?? null,

      recentBuilds: builds.slice(0, 10).map((build) => ({
        number: build.number,
        result: build.result ?? "BUILDING",
        building: build.building,
        durationMs: build.duration ?? 0,
        duration: formatDuration(build.duration),
        timestamp: build.timestamp,
        startedAt: build.timestamp
          ? new Date(build.timestamp).toISOString()
          : null,
        url: build.url,
      })),
    };

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Jenkins Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getJenkinsBuilds = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);

    const builds = await getBuildHistory();

    const recentBuilds = builds
      .slice(0, limit)
      .map((build) => ({
        number: build.number,
        result: build.result ?? "BUILDING",
        building: build.building,

        durationMs: build.duration ?? 0,

        duration: formatDuration(
          build.duration ?? 0
        ),

        timestamp: build.timestamp,

        startedAt: build.timestamp
          ? new Date(build.timestamp).toISOString()
          : null,

        url: build.url,
      }));

    return res.status(200).json({
      success: true,

      data: {
        total: recentBuilds.length,
        builds: recentBuilds,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
