import * as tl from "azure-pipelines-task-lib/task";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as fs from "fs";
import * as FormData from "form-data";
import * as path from "path";

async function run() {
  try {
    const personalAPIToken = tl.getInputRequired("personalAPIToken");
    const authEndpoint = tl.getInput("authEndpoint") ?? "https://auth.appcircle.io";
    const apiEndpoint = tl.getInput("apiEndpoint") ?? "https://api.appcircle.io";
    const appPath = tl.getInputRequired("appPath");
    const summary = tl.getInputRequired("summary");
    const releaseNotes = tl.getInputRequired("releaseNotes");
    const _publishType = tl.getInputRequired("publishType");
    var publishType = "0";

    const validExtensions = [".apk", ".aab", ".ipa"];
    const fileExtension = appPath.slice(appPath.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      tl.setResult(
        tl.TaskResult.Failed,
        `Invalid file extension: ${appPath}. For Android, use .apk or .aab. For iOS, use .ipa.`
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

    // Create Appcircle API instance
    const apiEndpointUrl = new URL(apiEndpoint).toString();
    const appcircleApi = axios.create({
      baseURL: apiEndpointUrl,
    });

    const loginResponse = await getToken(personalAPIToken, authEndpoint);
    UploadServiceHeaders.token = loginResponse.access_token;
    console.log("Logged in to Appcircle successfully");

    const uploadResponse = await uploadEnterpriseApp(appcircleApi, appPath);
    const status = await checkTaskStatus(appcircleApi, uploadResponse.taskId);

    if (!status) {
      tl.setResult(
        tl.TaskResult.Failed,
        `${uploadResponse.taskId} id upload request failed with status Cancelled`
      );
      return;
    }

    if (publishType !== "0") {
      const profileId = await getProfileId(appcircleApi);
      const appVersions = await getEnterpriseAppVersions(
        appcircleApi,
        {
          entProfileId: profileId,
        });
      const entVersionId = appVersions[0].id;
      await publishEnterpriseAppVersion(
        appcircleApi,
        {
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
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();

/* API */

export async function getToken(pat: string, authEndpoint: string): Promise<any> {
  const params = new URLSearchParams();
  params.append("pat", pat);

  try {
    const url = new URL('/auth/v1/token', authEndpoint).toString();
    const response = await axios.post(
      url,
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

export async function getEnterpriseProfiles(api: AxiosInstance) {
  const buildProfiles = await api.get(`store/v2/profiles`, {
    headers: UploadServiceHeaders.getHeaders(),
  });
  return buildProfiles.data;
}

async function uploadWithRetry(doUpload: () => Promise<any>, maxRetries = 5): Promise<any> {
  let attempt = 0;
  let delay = 1000;
  while (true) {
    try {
      return await doUpload();
    } catch (error: any) {
      const status = error?.response?.status;
      const retryable =
        status === 503 ||
        error?.code === "ECONNRESET" ||
        (typeof error?.message === "string" && error.message.includes("socket hang up"));
      if (!retryable || attempt >= maxRetries) {
        throw error;
      }
      attempt++;
      const jitter = Math.floor(Math.random() * 300);
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      delay *= 2;
    }
  }
}

export async function uploadEnterpriseApp(api: AxiosInstance, app: string) {
  const filePath = app;
  const fileName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;

  // Step 1: Get upload information (size-validated, returns the upload method)
  console.log("Getting file upload information...");
  const uploadInfoResponse = await api.get<{
    fileId: string;
    uploadUrl: string;
    configuration: {
      httpMethod: string;
      signParameters: Record<string, string>;
    };
  }>(`store/v1/profiles/app-versions`, {
    params: {
      action: "uploadInformation",
      fileName: fileName,
      fileSize: fileSize,
    },
    headers: UploadServiceHeaders.getHeaders(),
  });
  const { fileId, uploadUrl, configuration } = uploadInfoResponse.data;
  const { httpMethod, signParameters } = configuration;

  // Step 2: Upload the binary to object storage (PUT, or POST multipart for MinIO)
  console.log("Uploading file to Appcircle...");
  if (httpMethod.toUpperCase() === "POST") {
    await uploadWithRetry(() => {
      // @ts-ignore
      const data = new FormData();
      for (const [key, value] of Object.entries(signParameters)) {
        data.append(key, value);
      }
      data.append("file", fs.createReadStream(filePath), fileName);
      return axios.post(uploadUrl, data, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          ...data.getHeaders(),
        },
      });
    });
  } else if (httpMethod.toUpperCase() === "PUT") {
    await uploadWithRetry(() =>
      axios.put(uploadUrl, fs.readFileSync(filePath), {
        headers: {
          "Content-Type": "application/octet-stream",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
    );
  } else {
    throw new Error(`Unsupported upload HTTP method: ${httpMethod}`);
  }

  // Step 3: Commit. createNewProfile=true lets the server route the binary to its
  // profile by package (matching an existing one, or creating it if none exists),
  // preserving the previous auto-routing behavior.
  console.log("Committing file upload...");
  const commitResponse = await api.post<{ taskId: string }>(
    `store/v1/profiles/app-versions`,
    {
      fileId: fileId,
      fileName: fileName,
    },
    {
      params: { action: "commitFileUpload", createNewProfile: true },
      headers: UploadServiceHeaders.getHeaders(),
    }
  );
  return commitResponse.data;
}

export async function publishEnterpriseAppVersion(
  api: AxiosInstance,
  options: {
    entProfileId: string;
    entVersionId: string;
    summary: string;
    releaseNotes: string;
    publishType: string;
  }) {
  const versionResponse = await api.patch(
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

export async function getProfileId(api: AxiosInstance) {
  const profiles = await getEnterpriseProfiles(api).then((res) =>
    res.sort((a: any, b: any) => {
      return (
        new Date(b.lastBinaryReceivedDate).getTime() -
        new Date(a.lastBinaryReceivedDate).getTime()
      );
    })
  );

  return profiles[0].id;
}

export async function checkTaskStatus(api: AxiosInstance, taskId: string, currentAttempt = 0) {
  const response = await api.get(`/task/v1/tasks/${taskId}`, {
    headers: UploadServiceHeaders.getHeaders(),
  });

  if (response?.data.stateValue == 1 && currentAttempt < 100) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return checkTaskStatus(api, taskId, currentAttempt + 1);
  }

  if (response.data.stateValue === 2) {
    return false;
  }

  return true;
}

export async function getEnterpriseAppVersions(
  api: AxiosInstance,
  options: {
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

  const profileResponse = await api.get(
    `store/v2/profiles/${options.entProfileId}/app-versions${versionType}`,
    {
      headers: UploadServiceHeaders.getHeaders(),
    }
  );
  return profileResponse.data;
}
