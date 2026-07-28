import axios from "axios";

const {
  JENKINS_URL,
  JENKINS_USERNAME,
  JENKINS_API_TOKEN,
  JENKINS_JOB_NAME,
} = process.env;

const jenkinsClient = axios.create({
  baseURL: JENKINS_URL,
  auth: {
    username: JENKINS_USERNAME,
    password: JENKINS_API_TOKEN,
  },
  timeout: 15000,
});

const getErrorMessage = (error, fallbackMessage) => {
  if (error.response?.status === 401) {
    return "Jenkins authentication failed. Check username and API token.";
  }

  if (error.response?.status === 403) {
    return "Jenkins access forbidden. Check Jenkins user permissions.";
  }

  if (error.response?.status === 404) {
    return "Gemini AI report was not found in Jenkins artifacts.";
  }

  return (
    error.response?.data?.message ||
    error.message ||
    fallbackMessage
  );
};

const getEncodedJobName = () => {
  if (!JENKINS_JOB_NAME) {
    throw new Error(
      "JENKINS_JOB_NAME is missing from backend environment variables."
    );
  }

  return encodeURIComponent(JENKINS_JOB_NAME);
};

const encodeArtifactPath = (artifactPath) =>
  artifactPath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

const buildArtifactUrl = ({
  jobName,
  buildNumber,
  relativePath,
}) => {
  const baseUrl = String(JENKINS_URL || "").replace(
    /\/$/,
    ""
  );

  return `${baseUrl}/job/${jobName}/${buildNumber}/artifact/${encodeArtifactPath(
    relativePath
  )}`;
};

const getLatestSuccessfulBuild = async () => {
  const encodedJobName = getEncodedJobName();

  const response = await jenkinsClient.get(
    `/job/${encodedJobName}/lastSuccessfulBuild/api/json`,
    {
      params: {
        tree: "number,result,timestamp,url,artifacts[fileName,relativePath]",
      },
    }
  );

  return response.data;
};

const findArtifact = (
  artifacts,
  expectedFileName
) =>
  artifacts.find(
    (artifact) =>
      artifact.fileName === expectedFileName ||
      artifact.relativePath?.endsWith(
        `/${expectedFileName}`
      )
  );

export const getLatestAIReport = async () => {
  try {
    const encodedJobName = getEncodedJobName();
    const build = await getLatestSuccessfulBuild();

    const artifacts = build.artifacts ?? [];

    const markdownArtifact = findArtifact(
      artifacts,
      "AI_Report.md"
    );

    const htmlArtifact = findArtifact(
      artifacts,
      "AI_Report.html"
    );

    if (!markdownArtifact) {
      throw new Error(
        "AI_Report.md is not available in the latest successful Jenkins build."
      );
    }

    const markdownPath = encodeArtifactPath(
      markdownArtifact.relativePath
    );

    const reportResponse = await jenkinsClient.get(
      `/job/${encodedJobName}/${build.number}/artifact/${markdownPath}`,
      {
        responseType: "text",
        headers: {
          Accept: "text/markdown,text/plain,*/*",
        },
      }
    );

    const markdownUrl = buildArtifactUrl({
      jobName: encodedJobName,
      buildNumber: build.number,
      relativePath:
        markdownArtifact.relativePath,
    });

    const htmlUrl = htmlArtifact
      ? buildArtifactUrl({
          jobName: encodedJobName,
          buildNumber: build.number,
          relativePath:
            htmlArtifact.relativePath,
        })
      : null;

    return {
      buildNumber: build.number,
      buildResult: build.result,
      buildUrl: build.url,

      generatedAt: build.timestamp
        ? new Date(build.timestamp).toISOString()
        : null,

      fileName: markdownArtifact.fileName,
      relativePath:
        markdownArtifact.relativePath,

      format: "markdown",
      content: reportResponse.data,

      markdownUrl,
      htmlUrl,

      availableReports: {
        markdown: Boolean(markdownArtifact),
        html: Boolean(htmlArtifact),
      },
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to download Gemini AI report from Jenkins."
      )
    );
  }
};

export const getLatestAIHtmlReport = async () => {
  try {
    const encodedJobName = getEncodedJobName();
    const build = await getLatestSuccessfulBuild();

    const artifacts = build.artifacts ?? [];

    const htmlArtifact = findArtifact(
      artifacts,
      "AI_Report.html"
    );

    if (!htmlArtifact) {
      throw new Error(
        "AI_Report.html is not available in the latest successful Jenkins build."
      );
    }

    const htmlPath = encodeArtifactPath(
      htmlArtifact.relativePath
    );

    const reportResponse = await jenkinsClient.get(
      `/job/${encodedJobName}/${build.number}/artifact/${htmlPath}`,
      {
        responseType: "text",
        headers: {
          Accept: "text/html,*/*",
        },
      }
    );

    const htmlUrl = buildArtifactUrl({
      jobName: encodedJobName,
      buildNumber: build.number,
      relativePath: htmlArtifact.relativePath,
    });

    return {
      buildNumber: build.number,
      buildResult: build.result,
      buildUrl: build.url,

      generatedAt: build.timestamp
        ? new Date(build.timestamp).toISOString()
        : null,

      fileName: htmlArtifact.fileName,
      relativePath: htmlArtifact.relativePath,

      format: "html",
      htmlUrl,
      content: reportResponse.data,
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to download Gemini HTML report from Jenkins."
      )
    );
  }
};
