import * as tl from "azure-pipelines-task-lib/task";
import { exec, execSync } from "child_process";

const publishTypeValues: {
  readonly None: 0;
  readonly Beta: 1;
  readonly Live: 2;
} = {
  None: 0,
  Beta: 1,
  Live: 2,
};

async function run() {
  try {
    const accessToken = tl.getInputRequired("accessToken");
    const entProfileId = tl.getInputRequired("entProfileId");
    const appPath = tl.getInputRequired("appPath");
    const summary = tl.getInputRequired("summary");
    const releaseNotes = tl.getInputRequired("releaseNotes");
    const publishType = tl.getInputRequired("publishType");
    const inputs = {
      accessToken: isVariableName(accessToken)
        ? tl.getVariable(accessToken)
        : accessToken,
      entProfileId: isVariableName(entProfileId)
        ? tl.getVariable(entProfileId)
        : entProfileId,
      appPath: isVariableName(appPath) ? tl.getVariable(appPath) : appPath,
      summary: isVariableName(summary) ? tl.getVariable(summary) : summary,
      releaseNotes: isVariableName(releaseNotes)
        ? tl.getVariable(releaseNotes)
        : releaseNotes,
      publishType:
        publishTypeValues[publishType as keyof typeof publishTypeValues],
    };

    installACNpmPackage(() => {
      appcircleLogin(inputs.accessToken, () => {
        uploadForProfile(inputs.entProfileId!, inputs.appPath!, () => {
          getStoreVersionList(inputs.entProfileId!, (appVersionId) => {
            publishToAppStore(
              inputs.entProfileId!,
              appVersionId,
              inputs.summary!,
              inputs.releaseNotes!,
              inputs.publishType!,
              () => {
                tl.setResult(
                  tl.TaskResult.Succeeded,
                  "App published successfully"
                );
              }
            );
          });
        });
      });
    });

    tl.setResult(tl.TaskResult.Succeeded, "Artifact Published Successfully!");
  } catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();

function installACNpmPackage(callback: () => void) {
  exec("npm install -g @appcircle/cli", (error) => {
    if (error) {
      tl.setResult(tl.TaskResult.Failed, error.message);
      return;
    }

    callback();
  });
}

function appcircleLogin(accessToken: string | undefined, callback: () => void) {
  exec(`appcircle login --pat=${accessToken}`, (error) => {
    if (error) {
      tl.setResult(tl.TaskResult.Failed, error.message);
      return;
    }

    callback();
  });
}

function uploadForProfile(
  profileId: string,
  app: string,
  callback: () => void
) {
  const command = `appcircle enterprise-app-store version upload-for-profile --entProfileId ${profileId} --app ${app}`;
  try {
    execSync(command, { encoding: "utf-8" });
    callback();
  } catch (error: any) {
    tl.setResult(tl.TaskResult.Failed, error);
  }
}

function publishToAppStore(
  entProfileId: string,
  entVersionId: string,
  summary: string,
  releaseNote: string,
  publishType: number,
  callback: () => void
) {
  const command = `appcircle enterprise-app-store version publish --entProfileId ${entProfileId} --entVersionId ${entVersionId} --summary "${summary}" --releaseNotes "${releaseNote}" --publishType ${publishType}`;
  try {
    const output = execSync(command, { encoding: "utf-8" });
    tl.setResult(tl.TaskResult.Succeeded, "App Published Successfully!");
    callback();
  } catch (error: any) {
    tl.setResult(tl.TaskResult.Failed, error);
  }
}

function getStoreVersionList(
  entProfileId: string,
  callback: (appVersionId: string) => void
) {
  const command = `appcircle enterprise-app-store version list --entProfileId ${entProfileId}  -o json`;

  try {
    const output = execSync(command, { encoding: "utf-8" });
    const list = JSON.parse(output);
    callback(list?.[0]?.id);
  } catch (error: any) {
    tl.setResult(tl.TaskResult.Failed, error);
  }
}

function isVariableName(input: string): boolean {
  const variablePrefix = "$(";
  const variableSuffix = ")";
  if (input.startsWith(variablePrefix) && input.endsWith(variableSuffix)) {
    return true;
  }

  return false;
}
