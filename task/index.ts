import * as tl from "azure-pipelines-task-lib/task";
import axios, { AxiosRequestConfig } from "axios";
import * as fs from "fs";
import * as FormData from "form-data";

async function run() {
  try {
    const personalAPIToken = tl.getInputRequired("personalAPIToken");
    const appPath = tl.getInputRequired("appPath");
    const summary = tl.getInputRequired("summary");
    const releaseNotes = tl.getInputRequired("releaseNotes");
    const _publishType = tl.getInputRequired("publishType");
    var publishType = "0";

    const validExtensions = [".apk", ".ipa"];
    const fileExtension = appPath.slice(appPath.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      tl.setResult(
        tl.TaskResult.Failed,
        `Invalid file extension: ${appPath}. For Android, use .apk. For iOS, use .ipa.`
      );
      return;
    }

    if (
      _publishType !== "None" &&
      _publishType !== "Beta" &&
      _publishType !== "Live"
    ) {
      tl.setResult(
        tl.TaskResult.Failed,
        `Invalid publish type: ${_publishType}. Please use "None", "Beta" or "Live".`
      );
      return;
    }

    switch (_publishType) {
      case "None":
        publishType = "0";
        break;
      case "Beta":
        publishType = "1";
        break;
      case "Live":
        publishType = "2";
        break;
      default:
        break;
    }

    const loginResponse = await getToken(personalAPIToken);
    UploadServiceHeaders.token = loginResponse.access_token;
    console.log("Logged in to Appcircle successfully");

    const uploadResponse = await uploadEnterpriseApp(appPath);
    const status = await checkTaskStatus(uploadResponse.taskId);

    if (!status) {
      tl.setResult(
        tl.TaskResult.Failed,
        `${uploadResponse.taskId} id upload request failed with status Cancelled`
      );
      return;
    }

    if (publishType !== "0") {
      const profileId = await getProfileId();
      const appVersions = await getEnterpriseAppVersions({
        entProfileId: profileId,
      });
      const entVersionId = appVersions[0].id;
      await publishEnterpriseAppVersion({
        entProfileId: profileId,
        entVersionId: entVersionId,
        summary,
        releaseNotes,
        publishType,
      });
    }

    console.log(
      `${appPath} uploaded to the Appcircle Enterprise App Store successfully`
    );

    tl.setResult(
      tl.TaskResult.Succeeded,
      `${appPath} uploaded to the Appcircle Enterprise App Store successfully`
    );
  } catch (err: any) {
    console.log(err);
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();

/* API */

export async function getToken(pat: string): Promise<any> {
  const params = new URLSearchParams();
  params.append("pat", pat);

  try {
    const response = await axios.post(
      "https://auth.appcircle.io/auth/v1/token",
      params.toString(),
      {
        headers: {
          accept: "application/json",
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

export class UploadServiceHeaders {
  static token = "";

  static getHeaders = (): AxiosRequestConfig["headers"] => {
    let response: AxiosRequestConfig["headers"] = {
      accept: "application/json",
      "User-Agent": "Appcircle Github Action",
    };

    response.Authorization = `Bearer ${UploadServiceHeaders.token}`;

    return response;
  };
}

const API_HOSTNAME = "https://api.appcircle.io";
export const appcircleApi = axios.create({
  baseURL: API_HOSTNAME.endsWith("/") ? API_HOSTNAME : `${API_HOSTNAME}/`,
});
export async function getEnterpriseProfiles() {
  const buildProfiles = await appcircleApi.get(`store/v2/profiles`, {
    headers: UploadServiceHeaders.getHeaders(),
  });
  return buildProfiles.data;
}

export async function uploadEnterpriseApp(app: string) {
  // @ts-ignore
  const data = new FormData();
  data.append("File", fs.createReadStream(app));
  const uploadResponse = await appcircleApi.post(
    `store/v2/profiles/app-versions`,
    data,
    {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        ...UploadServiceHeaders.getHeaders(),
        ...data.getHeaders(),
        "Content-Type": "multipart/form-data;boundary=" + data.getBoundary(),
      },
    }
  );
  return uploadResponse.data;
}

export async function publishEnterpriseAppVersion(options: {
  entProfileId: string;
  entVersionId: string;
  summary: string;
  releaseNotes: string;
  publishType: string;
}) {
  const versionResponse = await appcircleApi.patch(
    `store/v2/profiles/${options.entProfileId}/app-versions/${options.entVersionId}?action=publish`,
    {
      summary: options.summary,
      releaseNotes: options.releaseNotes,
      publishType: options.publishType,
    },
    {
      headers: UploadServiceHeaders.getHeaders(),
    }
  );
  return versionResponse.data;
}

export async function getProfileId() {
  const profiles = await getEnterpriseProfiles().then((res) =>
    res.sort((a: any, b: any) => {
      return (
        new Date(b.lastBinaryReceivedDate).getTime() -
        new Date(a.lastBinaryReceivedDate).getTime()
      );
    })
  );

  return profiles[0].id;
}

export async function checkTaskStatus(taskId: string, currentAttempt = 0) {
  const response = await appcircleApi.get(`/task/v1/tasks/${taskId}`, {
    headers: UploadServiceHeaders.getHeaders(),
  });

  if (response?.data.stateValue == 1 && currentAttempt < 100) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return checkTaskStatus(taskId, currentAttempt + 1);
  }

  if (response.data.stateValue === 2) {
    return false;
  }

  return true;
}

export async function getEnterpriseAppVersions(options: {
  entProfileId: string;
  publishType?: string;
}) {
  let versionType = "";
  switch (options?.publishType) {
    case "1":
      versionType = "?publishtype=Beta";
      break;
    case "2":
      versionType = "?publishtype=Live";
    default:
      break;
  }

  const profileResponse = await appcircleApi.get(
    `store/v2/profiles/${options.entProfileId}/app-versions${versionType}`,
    {
      headers: UploadServiceHeaders.getHeaders(),
    }
  );
  return profileResponse.data;
}
