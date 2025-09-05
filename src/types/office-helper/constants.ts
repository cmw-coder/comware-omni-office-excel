import packageJson from 'app/package.json';

export const MAX_COLUMN_COUNT = 16384;
export const MAX_ROW_COUNT = 1048576;
export const OFFICE_JS_SCRIPT_TAG = `<script src="https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js"></script>`;
export const PROPERTY_FILE_ID_KEY = `${packageJson.name}.fileId`;
export const PROPERTY_PROJECT_ID_KEY = `${packageJson.name}.projectId`;
export const PROPERTY_TIMESTAMP_KEY = `${packageJson.name}.timestamp`;
export const PROPERTY_USER_ID_KEY = `${packageJson.name}.userId`;
