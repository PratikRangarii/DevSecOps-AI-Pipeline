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
  headers: {
    Accept: "application/json",
  },
  timeout: 10000,
});

const getJenkinsErrorMessage = (error, fallbackMessage) => {
  if (error.response?.status === 401) {
    return "Jenkins authentication failed. Check username and API token.";
  }

  if (error.response?.status === 403) {
    return "Jenkins access forbidden. Check user permissions.";
  }

  if (error.response?.status === 404) {
    return "Jenkins job not found. Check JENKINS_JOB_NAME.";
  }

  return (
    error.response?.data?.message ||
    error.message ||
    fallbackMessage
  );
};

export const getJobSummary = async () => {
  try {
    const encodedJobName = encodeURIComponent(JENKINS_JOB_NAME);

    const response = await jenkinsClient.get(
      `/job/${encodedJobName}/api/json`
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getJenkinsErrorMessage(
        error,
        "Unable to fetch Jenkins job summary"
      )
    );
  }
};

export const getLatestBuildDetails = async () => {
  try {
    const encodedJobName = encodeURIComponent(JENKINS_JOB_NAME);

    const response = await jenkinsClient.get(
      `/job/${encodedJobName}/lastBuild/api/json`
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getJenkinsErrorMessage(
        error,
        "Unable to fetch latest Jenkins build"
      )
    );
  }
};

export const getBuildHistory = async () => {
  try {
    const encodedJobName = encodeURIComponent(JENKINS_JOB_NAME);

    const response = await jenkinsClient.get(
      `/job/${encodedJobName}/api/json`,
      {
        params: {
          tree: "builds[number,result,duration,timestamp,building,url]",
        },
      }
    );

    return response.data.builds ?? [];
  } catch (error) {
    throw new Error(
      getJenkinsErrorMessage(
        error,
        "Unable to fetch Jenkins build history"
      )
    );
  }
};
