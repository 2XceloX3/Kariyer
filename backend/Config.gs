const Config = Object.freeze({
  VERSION: 'phase2-migration-2026-06-26',
  TZ: 'Europe/Istanbul',
  ROOT_FOLDER_ID: PropertiesService.getScriptProperties().getProperty('IESU_ROOT_FOLDER_ID') || '',
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('IESU_SPREADSHEET_ID') || '',
  ALLOWED_ROLES: ['super_admin', 'admin', 'company', 'student', 'alumni'],
});
