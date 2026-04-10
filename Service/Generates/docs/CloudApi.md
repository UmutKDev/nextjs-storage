# CloudApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /Api/Cloud/Delete | Delete objects|
|[**deleteVersion**](#deleteversion) | **DELETE** /Api/Cloud/Versions | Delete a specific version of a file|
|[**download**](#download) | **GET** /Api/Cloud/Download | Download a file for the authenticated user (streamed)|
|[**duplicateScanCancel**](#duplicatescancancel) | **POST** /Api/Cloud/Scan/Duplicate/Cancel | Cancel a running duplicate scan|
|[**duplicateScanResult**](#duplicatescanresult) | **GET** /Api/Cloud/Scan/Duplicate/Result | Get duplicate scan results|
|[**duplicateScanStart**](#duplicatescanstart) | **POST** /Api/Cloud/Scan/Duplicate/Start | Start duplicate file scan for a folder|
|[**duplicateScanStatus**](#duplicatescanstatus) | **GET** /Api/Cloud/Scan/Duplicate/Status | Get duplicate scan status and progress|
|[**find**](#find) | **GET** /Api/Cloud/Find | Get object metadata|
|[**getPresignedUrl**](#getpresignedurl) | **GET** /Api/Cloud/PresignedUrl | Get a presigned URL for upload/download|
|[**list**](#list) | **GET** /Api/Cloud/List | List files and directories|
|[**listBreadcrumb**](#listbreadcrumb) | **GET** /Api/Cloud/List/Breadcrumb | Get breadcrumb for a path|
|[**listDirectories**](#listdirectories) | **GET** /Api/Cloud/List/Directories | List directories inside a path|
|[**listObjects**](#listobjects) | **GET** /Api/Cloud/List/Objects | List objects (files) inside a path|
|[**listVersions**](#listversions) | **GET** /Api/Cloud/Versions | List previous versions of a file|
|[**move**](#move) | **PUT** /Api/Cloud/Move | Move/rename an object|
|[**restoreVersion**](#restoreversion) | **PUT** /Api/Cloud/Versions/Restore | Restore a previous version of a file|
|[**scanStatus**](#scanstatus) | **GET** /Api/Cloud/Scan/Status | Get antivirus scan status for a file|
|[**search**](#search) | **GET** /Api/Cloud/Search | Search files by name|
|[**update**](#update) | **PUT** /Api/Cloud/Update | Update object metadata or rename|
|[**userStorageUsage**](#userstorageusage) | **GET** /Api/Cloud/User/StorageUsage | Get user\&#39;s storage usage|

# **_delete**
> boolean _delete(cloudDeleteRequestModel)

Deletes one or more objects (or directories) belonging to the authenticated user.

### Example

```typescript
import {
    CloudApi,
    Configuration,
    CloudDeleteRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let idempotencyKey: string; // (default to undefined)
let cloudDeleteRequestModel: CloudDeleteRequestModel; //
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance._delete(
    idempotencyKey,
    cloudDeleteRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudDeleteRequestModel** | **CloudDeleteRequestModel**|  | |
| **idempotencyKey** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**boolean**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Delete succeeded |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteVersion**
> deleteVersion(cloudDeleteVersionRequestModel)

Permanently deletes a non-current version. Cannot delete the current (latest) version.

### Example

```typescript
import {
    CloudApi,
    Configuration,
    CloudDeleteVersionRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let cloudDeleteVersionRequestModel: CloudDeleteVersionRequestModel; //
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.deleteVersion(
    cloudDeleteVersionRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudDeleteVersionRequestModel** | **CloudDeleteVersionRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **download**
> File download()

Streams a file that belongs to the authenticated user. The server enforces a static per-user download speed (bytes/sec).

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let key: string; //Path/key to the file (user-scoped) (default to undefined)
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.download(
    key,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] | Path/key to the file (user-scoped) | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**File**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/octet-stream


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Binary file stream. Content-Type and Content-Length headers set where available. |  -  |
|**404** | File not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **duplicateScanCancel**
> CloudDuplicateScanCancelResponseBaseModel duplicateScanCancel(cloudDuplicateScanIdRequestModel)

Cancels a duplicate scan job if it is pending or running.

### Example

```typescript
import {
    CloudApi,
    Configuration,
    CloudDuplicateScanIdRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let cloudDuplicateScanIdRequestModel: CloudDuplicateScanIdRequestModel; //
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.duplicateScanCancel(
    cloudDuplicateScanIdRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudDuplicateScanIdRequestModel** | **CloudDuplicateScanIdRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**CloudDuplicateScanCancelResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **duplicateScanResult**
> CloudDuplicateScanResultResponseBaseModel duplicateScanResult()

Returns the duplicate groups found by a completed scan. Each group contains files that are duplicates of each other with similarity scores.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let scanId: string; //ID of the duplicate scan job (default to undefined)
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.duplicateScanResult(
    scanId,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **scanId** | [**string**] | ID of the duplicate scan job | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**CloudDuplicateScanResultResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **duplicateScanStart**
> CloudDuplicateScanStartResponseBaseModel duplicateScanStart(cloudDuplicateScanStartRequestModel)

Starts an async job to scan a folder for duplicate files. Uses SHA-256 for exact matches and perceptual hashing (dHash) for image similarity detection.

### Example

```typescript
import {
    CloudApi,
    Configuration,
    CloudDuplicateScanStartRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let cloudDuplicateScanStartRequestModel: CloudDuplicateScanStartRequestModel; //
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.duplicateScanStart(
    cloudDuplicateScanStartRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudDuplicateScanStartRequestModel** | **CloudDuplicateScanStartRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**CloudDuplicateScanStartResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **duplicateScanStatus**
> CloudDuplicateScanStatusResponseBaseModel duplicateScanStatus()

Returns the current status and progress of a duplicate scan job.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let scanId: string; //ID of the duplicate scan job (default to undefined)
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.duplicateScanStatus(
    scanId,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **scanId** | [**string**] | ID of the duplicate scan job | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**CloudDuplicateScanStatusResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **find**
> find()

Find a single object by key (user scoped) and return its metadata.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let key: string; // (default to undefined)
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.find(
    key,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPresignedUrl**
> StringResponseModel getPresignedUrl()

Returns a presigned URL for a specific object key to allow direct client access.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let key: string; // (default to undefined)
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)
let expiresInSeconds: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.getPresignedUrl(
    key,
    xTeamId,
    expiresInSeconds
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|
| **expiresInSeconds** | [**number**] |  | (optional) defaults to undefined|


### Return type

**StringResponseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list**
> CloudListResponseBaseModel list()

Returns a view (breadcrumbs, directories and objects) for the given user-scoped path. Supports delimiter and metadata processing flags. For encrypted folders, provide session token via X-Folder-Session header.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let path: string; // (optional) (default to undefined)
let delimiter: boolean; // (optional) (default to undefined)
let isMetadataProcessing: boolean; // (optional) (default to true)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)
let xHiddenSession: string; //Session token for hidden folder access (optional) (default to undefined)

const { status, data } = await apiInstance.list(
    xTeamId,
    search,
    skip,
    take,
    path,
    delimiter,
    isMetadataProcessing,
    xFolderSession,
    xHiddenSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|
| **delimiter** | [**boolean**] |  | (optional) defaults to undefined|
| **isMetadataProcessing** | [**boolean**] |  | (optional) defaults to true|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|
| **xHiddenSession** | [**string**] | Session token for hidden folder access | (optional) defaults to undefined|


### Return type

**CloudListResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listBreadcrumb**
> CloudBreadCrumbListBaseModel listBreadcrumb()

Returns breadcrumb entries (path pieces) for the supplied path.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let path: string; // (optional) (default to undefined)
let delimiter: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.listBreadcrumb(
    xTeamId,
    search,
    skip,
    take,
    path,
    delimiter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|
| **delimiter** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**CloudBreadCrumbListBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listDirectories**
> CloudDirectoryListBaseModel listDirectories()

Returns directory prefixes (folders) for a given path. For encrypted folders, provide session token via X-Folder-Session header.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let path: string; // (optional) (default to undefined)
let delimiter: boolean; // (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)
let xHiddenSession: string; //Session token for hidden folder access (optional) (default to undefined)

const { status, data } = await apiInstance.listDirectories(
    xTeamId,
    search,
    skip,
    take,
    path,
    delimiter,
    xFolderSession,
    xHiddenSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|
| **delimiter** | [**boolean**] |  | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|
| **xHiddenSession** | [**string**] | Session token for hidden folder access | (optional) defaults to undefined|


### Return type

**CloudDirectoryListBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listObjects**
> CloudObjectListBaseModel listObjects()

Returns files at a given path for the authenticated user. For encrypted folders, provide session token via X-Folder-Session header.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let path: string; // (optional) (default to undefined)
let delimiter: boolean; // (optional) (default to undefined)
let isMetadataProcessing: boolean; // (optional) (default to true)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.listObjects(
    xTeamId,
    search,
    skip,
    take,
    path,
    delimiter,
    isMetadataProcessing,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **path** | [**string**] |  | (optional) defaults to undefined|
| **delimiter** | [**boolean**] |  | (optional) defaults to undefined|
| **isMetadataProcessing** | [**boolean**] |  | (optional) defaults to true|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**CloudObjectListBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listVersions**
> CloudVersionListResponseBaseModel listVersions()

Returns the version history (non-current versions) for the given file key. Requires S3 bucket versioning to be enabled.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let key: string; // (default to undefined)
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.listVersions(
    key,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**CloudVersionListResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **move**
> boolean move(cloudMoveRequestModel)

Move an object from SourceKey to DestinationKey within the user scope.

### Example

```typescript
import {
    CloudApi,
    Configuration,
    CloudMoveRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let idempotencyKey: string; // (default to undefined)
let cloudMoveRequestModel: CloudMoveRequestModel; //
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.move(
    idempotencyKey,
    cloudMoveRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudMoveRequestModel** | **CloudMoveRequestModel**|  | |
| **idempotencyKey** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**boolean**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Move succeeded |  -  |
|**409** | Conflict detected — target already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **restoreVersion**
> restoreVersion(cloudRestoreVersionRequestModel)

Copies the specified old version as the new current version. The previous current version becomes a non-current version.

### Example

```typescript
import {
    CloudApi,
    Configuration,
    CloudRestoreVersionRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let cloudRestoreVersionRequestModel: CloudRestoreVersionRequestModel; //
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.restoreVersion(
    cloudRestoreVersionRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudRestoreVersionRequestModel** | **CloudRestoreVersionRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **scanStatus**
> CloudScanStatusResponseBaseModel scanStatus()

Returns the latest antivirus scan status for the given object key.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let key: string; // (default to undefined)
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.scanStatus(
    key,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**CloudScanStatusResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **search**
> CloudSearchResponseBaseModel search()

Recursively searches the user\'s files by partial filename match (case-insensitive). Optionally restrict to a specific path or filter by extension. Encrypted folder contents are excluded unless a valid session token is provided via X-Folder-Session header.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let query: string; //Search query - partial filename match (case-insensitive, min 2 chars) (default to undefined)
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)
let search: string; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let path: string; //Restrict search to a specific directory path (optional) (default to undefined)
let extension: string; //Filter by file extension (e.g. \"pdf\", \"jpg\"). Without leading dot. (optional) (default to undefined)
let isMetadataProcessing: boolean; // (optional) (default to false)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)
let xHiddenSession: string; //Session token for hidden folder access (optional) (default to undefined)

const { status, data } = await apiInstance.search(
    query,
    xTeamId,
    search,
    skip,
    take,
    path,
    extension,
    isMetadataProcessing,
    xFolderSession,
    xHiddenSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **query** | [**string**] | Search query - partial filename match (case-insensitive, min 2 chars) | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **path** | [**string**] | Restrict search to a specific directory path | (optional) defaults to undefined|
| **extension** | [**string**] | Filter by file extension (e.g. \&quot;pdf\&quot;, \&quot;jpg\&quot;). Without leading dot. | (optional) defaults to undefined|
| **isMetadataProcessing** | [**boolean**] |  | (optional) defaults to false|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|
| **xHiddenSession** | [**string**] | Session token for hidden folder access | (optional) defaults to undefined|


### Return type

**CloudSearchResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update**
> CloudObjectBaseModel update(cloudUpdateRequestModel)

Update an existing object by changing metadata or renaming the file (name only).

### Example

```typescript
import {
    CloudApi,
    Configuration,
    CloudUpdateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let cloudUpdateRequestModel: CloudUpdateRequestModel; //
let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.update(
    cloudUpdateRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cloudUpdateRequestModel** | **CloudUpdateRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**CloudObjectBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**409** | Conflict detected — target already exists |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userStorageUsage**
> CloudUserStorageUsageResponseBaseModel userStorageUsage()

Returns the authenticated user storage usage and limits.

### Example

```typescript
import {
    CloudApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudApi(configuration);

let xTeamId: string; //Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. (optional) (default to undefined)

const { status, data } = await apiInstance.userStorageUsage(
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xTeamId** | [**string**] | Optional team ID. When provided, all cloud operations target the team storage instead of personal storage. | (optional) defaults to undefined|


### Return type

**CloudUserStorageUsageResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

