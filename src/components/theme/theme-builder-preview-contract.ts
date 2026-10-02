import type {
  CmsTheme,
  ThemeBuilderPreviewMessage,
  ThemeTemplateDocument,
  ThemeTemplatePayload,
} from "@spree/sdk";

export function isTrustedThemeBuilderMessage(
  event: Pick<MessageEvent, "origin" | "source" | "data">,
  editorOrigin: string | null,
  parent: Window,
  themeId: string,
  templateType: string,
  templateKey: string,
): event is MessageEvent<ThemeBuilderPreviewMessage> {
  const data = event.data;
  const payload = data?.payload;
  return (
    !!editorOrigin &&
    event.origin === editorOrigin &&
    event.source === parent &&
    data?.type === "THEME_BUILDER_PREVIEW" &&
    !!payload &&
    typeof payload === "object" &&
    payload.themeId === themeId &&
    payload.templateType === templateType &&
    payload.templateKey === templateKey &&
    Array.isArray(payload.template?.order) &&
    typeof payload.template?.sections === "object" &&
    payload.template.sections !== null
  );
}

export function mergeThemeBuilderPreview(
  theme: CmsTheme,
  template: ThemeTemplatePayload,
  payload: ThemeBuilderPreviewMessage["payload"],
): {
  theme: CmsTheme;
  template: ThemeTemplatePayload;
  groups: { header: ThemeTemplateDocument; footer: ThemeTemplateDocument };
} {
  return {
    theme: {
      ...theme,
      settings: {
        ...theme.settings,
        ...payload.settings,
        colors: { ...theme.settings.colors, ...payload.settings.colors },
        shape: { ...theme.settings.shape, ...payload.settings.shape },
        layout: { ...theme.settings.layout, ...payload.settings.layout },
      },
    },
    template: { ...template, data: structuredClone(payload.template) },
    groups: {
      header: structuredClone(payload.sectionGroups.header),
      footer: structuredClone(payload.sectionGroups.footer),
    },
  };
}
