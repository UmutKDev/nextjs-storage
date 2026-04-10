# CloudDocumentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**acquireLock**](#acquirelock) | **POST** /Api/Cloud/Documents/Lock | Acquire edit lock on a document|
|[**create**](#create) | **POST** /Api/Cloud/Documents | Create a new text document|
|[**deleteVersion**](#deleteversion) | **DELETE** /Api/Cloud/Documents/Versions | Delete a specific version|
|[**diffVersions**](#diffversions) | **GET** /Api/Cloud/Documents/Versions/Diff | Diff between two versions|
|[**discardDraft**](#discarddraft) | **DELETE** /Api/Cloud/Documents/Draft | Discard draft|
|[**extendLock**](#extendlock) | **PUT** /Api/Cloud/Documents/Lock/Heartbeat | Extend lock TTL (heartbeat)|
|[**find**](#find) | **GET** /Api/Cloud/Documents/Find | Find document metadata|
|[**listVersions**](#listversions) | **GET** /Api/Cloud/Documents/Versions | List document versions|
|[**readContent**](#readcontent) | **GET** /Api/Cloud/Documents/Content | Read document content|
|[**releaseLock**](#releaselock) | **DELETE** /Api/Cloud/Documents/Lock | Release edit lock on a document|
|[**restoreVersion**](#restoreversion) | **PUT** /Api/Cloud/Documents/Versions/Restore | Restore a previous version|
|[**saveDraft**](#savedraft) | **POST** /Api/Cloud/Documents/Draft | Save draft (auto-save)|
|[**updateContent**](#updatecontent) | **PUT** /Api/Cloud/Documents/Content | Update document content|

# **acquireLock**
> DocumentLockResponseBaseModel acquireLock(documentKeyRequestModel)

Acquires a pessimistic edit lock (5-minute TTL). If already locked by the same user, extends the lock. If locked by another user, returns 423.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentKeyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentKeyRequestModel: DocumentKeyRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.acquireLock(
    documentKeyRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentKeyRequestModel** | **DocumentKeyRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


### Return type

**DocumentLockResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**423** | Document is locked by another user |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **create**
> DocumentResponseBaseModel create(documentCreateRequestModel)

Creates a new text document with optional initial content. Supported extensions: txt, md, js, ts, py, css, html, json, xml, yaml, yml, env, sql, sh, bash, csv, log, ini, cfg, conf.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentCreateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentCreateRequestModel: DocumentCreateRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.create(
    documentCreateRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentCreateRequestModel** | **DocumentCreateRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


### Return type

**DocumentResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Invalid extension or content too large |  -  |
|**409** | File already exists at the specified path |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteVersion**
> deleteVersion(documentDeleteVersionRequestModel)

Permanently deletes a non-current version of the document.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentDeleteVersionRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentDeleteVersionRequestModel: DocumentDeleteVersionRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.deleteVersion(
    documentDeleteVersionRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentDeleteVersionRequestModel** | **DocumentDeleteVersionRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


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

# **diffVersions**
> DocumentDiffResponseBaseModel diffVersions()

Computes a line-by-line diff between two document versions. Use \"current\" as a version ID to reference the latest content.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let key: string; // (default to undefined)
let sourceVersionId: string; //Source version ID. Use \"current\" for the current live version. (default to undefined)
let targetVersionId: string; //Target version ID to compare against (default to undefined)
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.diffVersions(
    key,
    sourceVersionId,
    targetVersionId,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **sourceVersionId** | [**string**] | Source version ID. Use \&quot;current\&quot; for the current live version. | defaults to undefined|
| **targetVersionId** | [**string**] | Target version ID to compare against | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


### Return type

**DocumentDiffResponseBaseModel**

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

# **discardDraft**
> boolean discardDraft(documentKeyRequestModel)

Deletes the draft from both Redis and S3 backup.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentKeyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentKeyRequestModel: DocumentKeyRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.discardDraft(
    documentKeyRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentKeyRequestModel** | **DocumentKeyRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


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
|**200** | Draft discarded |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **extendLock**
> DocumentLockResponseBaseModel extendLock(documentKeyRequestModel)

Extends the lock TTL by another 5 minutes. Client should call this every ~3 minutes to keep the lock alive.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentKeyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentKeyRequestModel: DocumentKeyRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.extendLock(
    documentKeyRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentKeyRequestModel** | **DocumentKeyRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


### Return type

**DocumentLockResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**403** | You do not own this lock |  -  |
|**404** | No active lock found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **find**
> DocumentResponseBaseModel find()

Returns metadata for a document by its S3 key.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let key: string; // (default to undefined)
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.find(
    key,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


### Return type

**DocumentResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**404** | Document not found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listVersions**
> listVersions()

Returns the version history for the document.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let key: string; // (default to undefined)
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.listVersions(
    key,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


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

# **readContent**
> DocumentContentResponseBaseModel readContent()

Returns the text content of a document. If IncludeDraft=true and a draft exists, returns the draft content instead.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let key: string; // (default to undefined)
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)
let includeDraft: boolean; //If true and a draft exists, return draft content instead (optional) (default to undefined)

const { status, data } = await apiInstance.readContent(
    key,
    xTeamId,
    includeDraft
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|
| **includeDraft** | [**boolean**] | If true and a draft exists, return draft content instead | (optional) defaults to undefined|


### Return type

**DocumentContentResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**404** | Document not found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **releaseLock**
> boolean releaseLock(documentKeyRequestModel)

Releases the edit lock. Only the lock owner can release it.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentKeyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentKeyRequestModel: DocumentKeyRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.releaseLock(
    documentKeyRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentKeyRequestModel** | **DocumentKeyRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


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
|**200** | Lock released |  -  |
|**403** | You do not own this lock |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **restoreVersion**
> restoreVersion(documentRestoreVersionRequestModel)

Copies the specified version as the new current version. Updates document metadata.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentRestoreVersionRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentRestoreVersionRequestModel: DocumentRestoreVersionRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.restoreVersion(
    documentRestoreVersionRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentRestoreVersionRequestModel** | **DocumentRestoreVersionRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


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

# **saveDraft**
> DocumentDraftResponseBaseModel saveDraft(documentDraftRequestModel)

Saves a draft version of the document to Redis. Throttled to 1 save per 10 seconds. Every 5th save is also persisted to S3 for durability.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentDraftRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentDraftRequestModel: DocumentDraftRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.saveDraft(
    documentDraftRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentDraftRequestModel** | **DocumentDraftRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


### Return type

**DocumentDraftResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**423** | Document is locked by another user |  -  |
|**429** | Auto-save throttled |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateContent**
> DocumentContentResponseBaseModel updateContent(documentUpdateContentRequestModel)

Saves new content to the document. If ExpectedContentHash is provided and does not match the current hash, returns 409 Conflict. Creates a new S3 version automatically.

### Example

```typescript
import {
    CloudDocumentsApi,
    Configuration,
    DocumentUpdateContentRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDocumentsApi(configuration);

let documentUpdateContentRequestModel: DocumentUpdateContentRequestModel; //
let xTeamId: string; //Optional team ID. When provided, document operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.updateContent(
    documentUpdateContentRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentUpdateContentRequestModel** | **DocumentUpdateContentRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, document operations target the team storage. | (optional) defaults to undefined|


### Return type

**DocumentContentResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Content too large or invalid |  -  |
|**409** | Content hash mismatch (concurrent edit detected) |  -  |
|**423** | Document is locked by another user |  -  |
|**429** | Save throttled (too frequent saves) |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

