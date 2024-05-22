## Appcircle Enterprise App Store

Appcircle Enterprise Mobile App Store is your own mobile app store to provide access to in-house apps with a customizable mobile storefront.

- Appcircle Enterprise App Store provides an app store to distribute your in-house apps with a customizable mobile storefront.

- Everything you need for secure distribution of your in-house apps in a streamlined manner.

- It allows distribution of B2B and B2E applications without the need for an MDM solution and enrollment.

Learn more about [Appcircle Enterprise App Store](https://appcircle.io/enterprise-app-store)

## What Sets Apart Appcircle Enterprise Mobile App Store

The Appcircle Enterprise Mobile App Store lets users share their .IPA, APK, or AAB files with others, skipping the need to use App Store TestFlight or Google Play Internal Testing. One of its benefits is that you don’t need to increase the app’s build number just to send it for testing. Most importantly, this feature offers two ways to share your app: marking it as ‘beta’ or Live. This means you can share any bugs or new features without affecting the development lifecyle. Moreover, Appcircle ensures extra secure authentication using a username and password for accessing the Enterprise Mobile App Store

![Enterprise App Store Dashboard](images/ent_app_store.png)

### Generating/Managing the Personal API Tokens

To generate a Personal API Token, go to the My Organization screen on second option at the bottom left.You'll find the Personal API Token section in the top right corner.

Press the "Generate Token" button to generate your first token.

![Token Generation](images/PAT.png)

## How to use Appcircle Enterprise Mobile App Store Extension

Go to your pipelien and search for "Appcircle Enterprise Store" and provide required informations such as Appcircle Access Token and then hit the add button to publish your app. After fulfulling the inputs you should be seeing similiar in your pipeline file

```yaml
- task: AppcircleEnterpriseStore@0
  inputs:
    accessToken: "YOUR_PAT" # Your Appcircle Access Token
    entProfileId: "PROFILE_ID" # ID of your Appcircle Enterprise Mobile App Store Profile
    appPath: "APK_PATH" # Path to your iOS .ipa, or Android APK
    summary: "Summary Notes" # Summary Notes about the version of your app
    releaseNotes: "Release Notes" # Release Notes about the version of your app
    publishType: "Beta" # Publishment type of your app None|Beta|Live
```

### Leveraging Environment Variables

Utilize environment variables seamlessly by substituting the parameters with `$(VARIABLE_NAME)` in your task inputs. The extension automatically retrieves values from the specified environment variables within your pipeline.

### Reference

- For details about the module, visit [Appcircle Enterprise App Store](https://appcircle.io/enterprise-app-store)
