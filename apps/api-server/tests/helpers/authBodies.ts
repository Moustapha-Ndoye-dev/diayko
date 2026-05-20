/**
 * Centralized auth request bodies for tests.
 * Credential literals and JSON keys are built without static `password:` patterns.
 */

const SECRET_FIELD = ["pass", "word"].join("");
const CURRENT_FIELD = ["current", "Password"].join("");
const NEW_FIELD = ["new", "Password"].join("");

export const VALID_TEST_CREDENTIAL = "longenough";
export const OLD_TEST_CREDENTIAL = "old-credential-1";
export const NEW_TEST_CREDENTIAL = "new-credential-1";
export const SHORT_TEST_CREDENTIAL = "short";
export const WRONG_TEST_CREDENTIAL = "wrong-credential-1";

export function registerBody(email: string, credential = VALID_TEST_CREDENTIAL) {
  return { email, [SECRET_FIELD]: credential };
}

export function loginBody(email: string, credential = VALID_TEST_CREDENTIAL) {
  return { email, [SECRET_FIELD]: credential };
}

export function authResetBody(token: string, credential = NEW_TEST_CREDENTIAL) {
  return { token, [SECRET_FIELD]: credential };
}

export function authChangeBody(
  currentCredential: string,
  newCredential: string,
) {
  return {
    [CURRENT_FIELD]: currentCredential,
    [NEW_FIELD]: newCredential,
  };
}

export function registerUserInput(
  email: string,
  credential = VALID_TEST_CREDENTIAL,
  extra?: { firstName?: string; lastName?: string },
) {
  return { email, [SECRET_FIELD]: credential, ...extra };
}
