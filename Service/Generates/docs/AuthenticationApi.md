# AuthenticationApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**login**](#login) | **POST** /Api/Authentication/Login | Step 2: Login with email and password|
|[**loginCheck**](#logincheck) | **POST** /Api/Authentication/Login/Check | Step 1: Check email and get authentication requirements|
|[**logout**](#logout) | **POST** /Api/Authentication/Logout | Logout current session|
|[**passkeyLoginBegin**](#passkeyloginbegin) | **POST** /Api/Authentication/Passkey/Login/Begin | Step 2 (Alternative): Begin passkey login|
|[**passkeyLoginFinish**](#passkeyloginfinish) | **POST** /Api/Authentication/Passkey/Login/Finish | Step 2 (Alternative): Complete passkey login|
|[**register**](#register) | **POST** /Api/Authentication/Register | Register new user|
|[**resetPassword**](#resetpassword) | **POST** /Api/Authentication/ResetPassword | Reset password and send new password via email|
|[**verify2FA**](#verify2fa) | **POST** /Api/Authentication/Verify2FA | Step 3: Verify 2FA code after login|

# **login**
> AuthenticationResponseBaseModel login(loginRequestModel)

After checking email with Login/Check, use this endpoint to authenticate with password. If 2FA is enabled, the response will have RequiresTwoFactor=true and you need to call Verify2FA.

### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    LoginRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let loginRequestModel: LoginRequestModel; //

const { status, data } = await apiInstance.login(
    loginRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **loginRequestModel** | **LoginRequestModel**|  | |


### Return type

**AuthenticationResponseBaseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **loginCheck**
> LoginCheckResponseBaseModel loginCheck(loginCheckRequestModel)

Returns available authentication methods (password, passkey), 2FA status, and passkey options if available. This should be the first step in the login flow.

### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    LoginCheckRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let loginCheckRequestModel: LoginCheckRequestModel; //

const { status, data } = await apiInstance.loginCheck(
    loginCheckRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **loginCheckRequestModel** | **LoginCheckRequestModel**|  | |


### Return type

**LoginCheckResponseBaseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logout**
> BooleanResponseModel logout()


### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

const { status, data } = await apiInstance.logout();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BooleanResponseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **passkeyLoginBegin**
> PasskeyLoginBeginResponseBaseModel passkeyLoginBegin(passkeyLoginBeginRequestModel)

Alternative to password login. Use this if Login/Check returned HasPasskey=true. PasskeyOptions from Login/Check can also be used directly.

### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    PasskeyLoginBeginRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let passkeyLoginBeginRequestModel: PasskeyLoginBeginRequestModel; //

const { status, data } = await apiInstance.passkeyLoginBegin(
    passkeyLoginBeginRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **passkeyLoginBeginRequestModel** | **PasskeyLoginBeginRequestModel**|  | |


### Return type

**PasskeyLoginBeginResponseBaseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **passkeyLoginFinish**
> AuthenticationResponseBaseModel passkeyLoginFinish(passkeyLoginFinishRequestModel)

Complete the passkey authentication. Note: Passkey login bypasses 2FA requirement.

### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    PasskeyLoginFinishRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let passkeyLoginFinishRequestModel: PasskeyLoginFinishRequestModel; //

const { status, data } = await apiInstance.passkeyLoginFinish(
    passkeyLoginFinishRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **passkeyLoginFinishRequestModel** | **PasskeyLoginFinishRequestModel**|  | |


### Return type

**AuthenticationResponseBaseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **register**
> AuthenticationResponseBaseModel register(registerRequestModel)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    RegisterRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let registerRequestModel: RegisterRequestModel; //

const { status, data } = await apiInstance.register(
    registerRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registerRequestModel** | **RegisterRequestModel**|  | |


### Return type

**AuthenticationResponseBaseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resetPassword**
> BooleanResponseModel resetPassword(resetPasswordRequestModel)


### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    ResetPasswordRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let resetPasswordRequestModel: ResetPasswordRequestModel; //

const { status, data } = await apiInstance.resetPassword(
    resetPasswordRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resetPasswordRequestModel** | **ResetPasswordRequestModel**|  | |


### Return type

**BooleanResponseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verify2FA**
> AuthenticationResponseBaseModel verify2FA(twoFactorVerifyRequestModel)

If Login or Passkey/Login/Finish returns RequiresTwoFactor=true, use this endpoint to complete authentication with a TOTP code or backup code.

### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    TwoFactorVerifyRequestModel
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let twoFactorVerifyRequestModel: TwoFactorVerifyRequestModel; //

const { status, data } = await apiInstance.verify2FA(
    twoFactorVerifyRequestModel
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **twoFactorVerifyRequestModel** | **TwoFactorVerifyRequestModel**|  | |


### Return type

**AuthenticationResponseBaseModel**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

