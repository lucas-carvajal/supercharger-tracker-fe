export interface LoginFormState {
  error: string | null;
}

export interface ImportFormState {
  error: string | null;
  result: string | null;
  response: string | null;
}

export const initialLoginFormState: LoginFormState = {
  error: null,
};

export const initialImportFormState: ImportFormState = {
  error: null,
  result: null,
  response: null,
};
