export const LOGIN_MIN_LENGTH = 5;
export const LOGIN_MAX_LENGTH = 64;
export const PASSWORD_MIN_LENGTH = 5;
export const PASSWORD_MAX_LENGTH = 64;

export const PHONE_NUMBER_REGEX = /^[\d-]{10,13}$/;
export const LETTERS_NUMBERS_SIGNS_REGEX =
    /^[a-zA-Zа-яА-Я0-9\s\-.,!@#$%^&*()_+=:;'"?/\\|{}[\]<>~`№]+$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const SSN_VALID_LENGTH = 9;
export const SSN_REGEX =
    /^(?!000|666|${SSN_VALID_LENGTH}\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$|^(?!000|666|${SSN_VALID_LENGTH}\d{2})\d{3}(?!00)\d{2}(?!0000)\d{4}$/;
export const LATIN_PASSWORD_DISALLOWED_REGEX = /[^A-Za-z0-9!@#$%^&*()\-+_=.,;:'"?/\\|{}[\]<>~`№]/g;
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()\-+]/;
export const LOWERCASE_REGEX = /[a-z]/;
export const UPPERCASE_REGEX = /[A-Z]/;
export const NUMBER_REGEX = /\d/;

export const PASSWORD_REGEX = {
    FULL_REGEX: `^(?=.*${LOWERCASE_REGEX})(?=.*${UPPERCASE_REGEX})(?=.*${NUMBER_REGEX})(?=.*${SPECIAL_CHAR_REGEX}).{${PASSWORD_MIN_LENGTH},${PASSWORD_MAX_LENGTH}}$`,
    LENGTH_REGEX: `^.{${PASSWORD_MIN_LENGTH},${PASSWORD_MAX_LENGTH}}$`,
    LOWERCASE_REGEX,
    UPPERCASE_REGEX,
    NUMBER_REGEX,
    SPECIAL_CHAR_REGEX,
};
