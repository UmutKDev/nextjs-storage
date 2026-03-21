export type {
  DocumentResponseModel,
  DocumentContentResponseModel,
  DocumentLockResponseModel,
  DocumentDraftResponseModel,
  DocumentDiffResponseModel,
  DocumentDiffHunkModel,
  DocumentDiffStatsModel,
  DocumentCreateRequestModel,
  DocumentUpdateContentRequestModel,
  DocumentDraftRequestModel,
  DocumentKeyRequestModel,
  DocumentRestoreVersionRequestModel,
  DocumentDeleteVersionRequestModel,
} from "@/Service/Generates/api";

export {
  DocumentResponseModelTypeEnum as DocumentType,
  DocumentResponseModelLanguageEnum as DocumentLanguage,
  DocumentResponseModelLockStatusEnum as DocumentLockStatus,
  DocumentContentResponseModelLockStatusEnum as DocumentContentLockStatus,
  DocumentCreateRequestModelConflictStrategyEnum as ConflictResolutionStrategy,
} from "@/Service/Generates/api";
