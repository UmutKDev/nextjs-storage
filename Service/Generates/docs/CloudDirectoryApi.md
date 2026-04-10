# CloudDirectoryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**directoryConceal**](#directoryconceal) | **POST** /Api/Cloud/Directory/Conceal | Conceal hidden directories|
|[**directoryConvertToEncrypted**](#directoryconverttoencrypted) | **POST** /Api/Cloud/Directory/Encrypt | Convert a directory to encrypted|
|[**directoryCreate**](#directorycreate) | **POST** /Api/Cloud/Directory | Create a directory|
|[**directoryDecrypt**](#directorydecrypt) | **POST** /Api/Cloud/Directory/Decrypt | Remove encryption from a directory|
|[**directoryDelete**](#directorydelete) | **DELETE** /Api/Cloud/Directory | Delete a directory|
|[**directoryHide**](#directoryhide) | **POST** /Api/Cloud/Directory/Hide | Hide a directory|
|[**directoryLock**](#directorylock) | **POST** /Api/Cloud/Directory/Lock | Lock an encrypted directory|
|[**directoryRename**](#directoryrename) | **PUT** /Api/Cloud/Directory/Rename | Rename a directory|
|[**directoryReveal**](#directoryreveal) | **POST** /Api/Cloud/Directory/Reveal | Reveal hidden directories|
|[**directoryUnhide**](#directoryunhide) | **POST** /Api/Cloud/Directory/Unhide | Unhide a directory|
|[**directoryUnlock**](#directoryunlock) | **POST** /Api/Cloud/Directory/Unlock | Unlock an encrypted directory|

# **directoryConceal**
> boolean directoryConceal(directoryConcealRequestModel)

Invalidates the session token for hidden directories, hiding them from listings again.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryConcealRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let directoryConcealRequestModel: DirectoryConcealRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.directoryConceal(
    directoryConcealRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryConcealRequestModel** | **DirectoryConcealRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|


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
|**200** | Directory concealed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **directoryConvertToEncrypted**
> DirectoryResponseBaseModel directoryConvertToEncrypted(directoryConvertToEncryptedRequestModel)

Marks an existing directory as encrypted. Provide passphrase via X-Folder-Passphrase header.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryConvertToEncryptedRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let xFolderPassphrase: string; //Passphrase for encryption (min 8 chars) (default to undefined)
let directoryConvertToEncryptedRequestModel: DirectoryConvertToEncryptedRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.directoryConvertToEncrypted(
    xFolderPassphrase,
    directoryConvertToEncryptedRequestModel,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryConvertToEncryptedRequestModel** | **DirectoryConvertToEncryptedRequestModel**|  | |
| **xFolderPassphrase** | [**string**] | Passphrase for encryption (min 8 chars) | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**DirectoryResponseBaseModel**

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

# **directoryCreate**
> DirectoryResponseBaseModel directoryCreate(directoryCreateRequestModel)

Creates a new directory. For encrypted directories, set IsEncrypted=true and provide passphrase via X-Folder-Passphrase header.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryCreateRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let directoryCreateRequestModel: DirectoryCreateRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)
let xFolderPassphrase: string; //Passphrase for encrypted directory (min 8 chars) (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.directoryCreate(
    directoryCreateRequestModel,
    xTeamId,
    xFolderPassphrase,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryCreateRequestModel** | **DirectoryCreateRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|
| **xFolderPassphrase** | [**string**] | Passphrase for encrypted directory (min 8 chars) | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**DirectoryResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**409** | Conflict detected — directory already exists |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **directoryDecrypt**
> DirectoryResponseBaseModel directoryDecrypt(directoryDecryptRequestModel)

Removes encryption from a directory (keeps files). Provide passphrase via X-Folder-Passphrase header.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryDecryptRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let xFolderPassphrase: string; //Passphrase for decryption (default to undefined)
let directoryDecryptRequestModel: DirectoryDecryptRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.directoryDecrypt(
    xFolderPassphrase,
    directoryDecryptRequestModel,
    xTeamId,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryDecryptRequestModel** | **DirectoryDecryptRequestModel**|  | |
| **xFolderPassphrase** | [**string**] | Passphrase for decryption | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**DirectoryResponseBaseModel**

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

# **directoryDelete**
> boolean directoryDelete(directoryDeleteRequestModel)

Deletes a directory and all its contents. For encrypted directories, provide passphrase via X-Folder-Passphrase header.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryDeleteRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let directoryDeleteRequestModel: DirectoryDeleteRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)
let xFolderPassphrase: string; //Passphrase for encrypted directory (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.directoryDelete(
    directoryDeleteRequestModel,
    xTeamId,
    xFolderPassphrase,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryDeleteRequestModel** | **DirectoryDeleteRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|
| **xFolderPassphrase** | [**string**] | Passphrase for encrypted directory | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


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
|**200** | Directory deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **directoryHide**
> DirectoryResponseBaseModel directoryHide(directoryHideRequestModel)

Marks a directory as hidden. Hidden directories are not shown in directory listings unless a valid hidden session token is provided. Provide passphrase via X-Folder-Passphrase header.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryHideRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let xFolderPassphrase: string; //Passphrase for hidden directory (min 8 chars) (default to undefined)
let directoryHideRequestModel: DirectoryHideRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.directoryHide(
    xFolderPassphrase,
    directoryHideRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryHideRequestModel** | **DirectoryHideRequestModel**|  | |
| **xFolderPassphrase** | [**string**] | Passphrase for hidden directory (min 8 chars) | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|


### Return type

**DirectoryResponseBaseModel**

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

# **directoryLock**
> boolean directoryLock(directoryLockRequestModel)

Invalidates the session token for an encrypted directory.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryLockRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let directoryLockRequestModel: DirectoryLockRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.directoryLock(
    directoryLockRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryLockRequestModel** | **DirectoryLockRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|


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
|**200** | Directory locked |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **directoryRename**
> DirectoryResponseBaseModel directoryRename(directoryRenameRequestModel)

Renames a directory. For encrypted directories, provide passphrase via X-Folder-Passphrase header.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryRenameRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let directoryRenameRequestModel: DirectoryRenameRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)
let xFolderPassphrase: string; //Passphrase for encrypted directory (optional) (default to undefined)
let xFolderSession: string; //Session token for encrypted folder access (optional) (default to undefined)

const { status, data } = await apiInstance.directoryRename(
    directoryRenameRequestModel,
    xTeamId,
    xFolderPassphrase,
    xFolderSession
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryRenameRequestModel** | **DirectoryRenameRequestModel**|  | |
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|
| **xFolderPassphrase** | [**string**] | Passphrase for encrypted directory | (optional) defaults to undefined|
| **xFolderSession** | [**string**] | Session token for encrypted folder access | (optional) defaults to undefined|


### Return type

**DirectoryResponseBaseModel**

### Authorization

[cookie](../README.md#cookie)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**409** | Conflict detected — target directory already exists |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **directoryReveal**
> DirectoryRevealResponseBaseModel directoryReveal(directoryRevealRequestModel)

Validates passphrase and creates a session token for viewing hidden directories. The session token should be passed via X-Hidden-Session header in subsequent list requests.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryRevealRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let xFolderPassphrase: string; //Passphrase for hidden directory (min 8 chars) (default to undefined)
let directoryRevealRequestModel: DirectoryRevealRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.directoryReveal(
    xFolderPassphrase,
    directoryRevealRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryRevealRequestModel** | **DirectoryRevealRequestModel**|  | |
| **xFolderPassphrase** | [**string**] | Passphrase for hidden directory (min 8 chars) | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|


### Return type

**DirectoryRevealResponseBaseModel**

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

# **directoryUnhide**
> DirectoryResponseBaseModel directoryUnhide(directoryUnhideRequestModel)

Removes hidden status from a directory. Provide passphrase via X-Folder-Passphrase header.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryUnhideRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let xFolderPassphrase: string; //Passphrase for hidden directory (default to undefined)
let directoryUnhideRequestModel: DirectoryUnhideRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.directoryUnhide(
    xFolderPassphrase,
    directoryUnhideRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryUnhideRequestModel** | **DirectoryUnhideRequestModel**|  | |
| **xFolderPassphrase** | [**string**] | Passphrase for hidden directory | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|


### Return type

**DirectoryResponseBaseModel**

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

# **directoryUnlock**
> DirectoryUnlockResponseBaseModel directoryUnlock(directoryUnlockRequestModel)

Validates passphrase and creates a session token for subsequent access. The session token should be passed via X-Folder-Session header in subsequent requests.

### Example

```typescript
import {
    CloudDirectoryApi,
    Configuration,
    DirectoryUnlockRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new CloudDirectoryApi(configuration);

let xFolderPassphrase: string; //Passphrase for encrypted directory (min 8 chars) (default to undefined)
let directoryUnlockRequestModel: DirectoryUnlockRequestModel; //
let xTeamId: string; //Optional team ID. When provided, directory operations target the team storage. (optional) (default to undefined)

const { status, data } = await apiInstance.directoryUnlock(
    xFolderPassphrase,
    directoryUnlockRequestModel,
    xTeamId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **directoryUnlockRequestModel** | **DirectoryUnlockRequestModel**|  | |
| **xFolderPassphrase** | [**string**] | Passphrase for encrypted directory (min 8 chars) | defaults to undefined|
| **xTeamId** | [**string**] | Optional team ID. When provided, directory operations target the team storage. | (optional) defaults to undefined|


### Return type

**DirectoryUnlockResponseBaseModel**

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

