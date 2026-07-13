## Appcircle Enterprise App Store

Appcircle Enterprise App Store is your own mobile app store for providing access to in-house apps with a customizable mobile storefront.

- **Customizable Storefront:** Distribute your in-house apps with a fully customizable mobile storefront.
- **Secure Distribution:** Everything you need for secure, streamlined distribution of your in-house apps.
- **No MDM Required:** Allows distribution of B2B and B2E applications without the need for an MDM solution and enrollment.

**Flexible Sharing Options**

- **Beta and Live Channels:** Share your app on the Beta channel for testing new features or identifying bugs, or on the Live channel for stable versions.
- **Unlisted Publishing:** Publish an app version as unlisted to make it accessible only through a direct link, without appearing in the store's app list.

**Re-Sign and Auto-Resign**

- **Update Without Rebuilding:** Re-sign iOS and Android binaries with updated signing identities, manually or automatically, and keep distributing without a new build.

Learn more about [Appcircle Enterprise App Store](https://appcircle.io/enterprise-app-store?&utm_source=azure&utm_medium=product&utm_campaign=enterprise_app_store).

## What Sets Apart Appcircle Enterprise App Store

1. **Direct File Sharing:**
   - **Skip Traditional Stores:** Share .IPA, APK, or AAB files directly, avoiding the need to wait for Apple App Store or Google Play approvals.
2. **Flexible Sharing Options:**
   - **Beta and Live Modes:** Share your app in ‘beta’ mode for testing new features or identifying bugs, or in ‘live’ mode for stable versions. This flexibility helps maintain the development lifecycle without interruptions.
3. **Enhanced Security:**
   - **Secure Authentication:** Access the Enterprise App Store with extra secure authentication using Enterprise Authentication Methods.
   - **Controlled Access:** Ensure that only authorized users can access the app store and its contents.
4. **Customizable Mobile Storefront:**
   - **Tailored Experience:** Provide a customizable mobile storefront for your in-house apps, ensuring a tailored experience that aligns with your brand and user needs.
5. **No MDM Requirement:**
   - **Simplified Distribution:** Distribute B2B and B2E applications without the need for a Mobile Device Management (MDM) solution or enrollment, reducing complexity and costs.
6. **Streamlined Workflow:**
   - **Seamless Integration:** Integrates smoothly with your existing workflow, making it easy to manage and distribute apps within your organization.
   - **Efficient Management:** Track and manage applications, versions, testers, and teams effectively, ensuring a smooth distribution process.

These features make the Appcircle Enterprise App Store a powerful tool for securely and efficiently distributing in-house applications, offering flexibility, enhanced security, and a streamlined workflow.

## How to use Appcircle Enterprise App Store Extension

```yaml
- task: AppcircleEnterpriseStore@0
  inputs:
    personalAPIToken: $(AC_PERSONAL_API_TOKEN)
    authEndpoint: $(AC_AUTH_ENDPOINT)
    apiEndpoint: $(AC_API_ENDPOINT)
    subOrganizationName: $(AC_SUB_ORGANIZATION_NAME)
    appPath: $(AC_APP_PATH)
    summary: $(AC_SUMMARY)
    releaseNotes: $(AC_RELEASE_NOTES)
    publishType: $(AC_PUBLISH_TYPE)
```

- `personalAPIToken`: The Appcircle Personal API token used to authenticate and authorize access to Appcircle services within this extension.
- `authEndpoint` (optional): Authentication endpoint URL for self-hosted Appcircle installations. Defaults to `https://auth.appcircle.io`.
- `apiEndpoint` (optional): API endpoint URL for self-hosted Appcircle installations. Defaults to `https://api.appcircle.io`.
- `subOrganizationName` (optional): Sub-organization name for the enterprise store. Leave empty to use the root organization. Use this when your Personal API Token belongs to the root organization but the target enterprise store lives in a sub-organization.

> **Self-signed or private CA certificates:** If your self-hosted Appcircle server uses a self-signed certificate (or one issued by a private/internal CA), requests will fail certificate validation. The task does not disable TLS verification. Trust the server's CA on the build agent: set the `NODE_EXTRA_CA_CERTS` environment variable to a PEM file containing the CA certificate, or add the CA to the system certificate store.

- `appPath`: Indicates the file path to the application that will be uploaded to
  Appcircle Enterprise App Store.
- `releaseNote`: Contains the details of changes, updates, and improvements made
  in the current version of the app being published.
- `summary`: Used to provide a brief overview of the version of the app that is
  about to be published.
- `publishType`: Specifies the publishing status as either none, beta, or live,
  and must be assigned the values "None", "Beta", or "Live" accordingly.

## Further Details

For more information please refer to the documentation.

- [Setting Up Appcircle Enterprise App Store in Azure DevOps Pipeline](https://docs.appcircle.io/marketplace/visual-studio-marketplace/enterprise-app-store)
  - [System Requirements](https://docs.appcircle.io/marketplace/visual-studio-marketplace/enterprise-app-store#system-requirements)
  - [Setup Appcircle Enterprise App Store](https://docs.appcircle.io/marketplace/visual-studio-marketplace/enterprise-app-store#setup-appcircle-enterprise-app-store)
  - [How to Get the Appcircle Enterprise App Store Extension](https://docs.appcircle.io/marketplace/visual-studio-marketplace/enterprise-app-store#how-to-get-the-appcircle-enterprise-app-store-extension)
  - [How to Add the Appcircle Enterprise App Store Task into Your Pipeline](https://docs.appcircle.io/marketplace/visual-studio-marketplace/enterprise-app-store#how-to-add-the-appcircle-enterprise-app-store-task-into-your-pipeline)
  - [Using with Appcircle Self-Hosted](https://docs.appcircle.io/marketplace/visual-studio-marketplace/enterprise-app-store#using-with-appcircle-self-hosted)
  - [Leveraging Environment Variables](https://docs.appcircle.io/marketplace/visual-studio-marketplace/enterprise-app-store#leveraging-environment-variables)
- [References](https://docs.appcircle.io/marketplace/visual-studio-marketplace/enterprise-app-store#references)
