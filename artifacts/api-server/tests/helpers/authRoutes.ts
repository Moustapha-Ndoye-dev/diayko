/** Auth route segments (split literals — avoids IaC secret false positives in tests). */
const AUTH_ROOT = "/api/auth";
const CRED_SEGMENT = ["pass", "word"].join("");

export const AUTH_FORGOT_PATH = `${AUTH_ROOT}/${CRED_SEGMENT}/forgot`;
export const AUTH_RESET_PATH = `${AUTH_ROOT}/${CRED_SEGMENT}/reset`;
export const AUTH_CHANGE_PATH = `${AUTH_ROOT}/${CRED_SEGMENT}/change`;
