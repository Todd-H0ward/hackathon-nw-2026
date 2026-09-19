const CAMEL_CASE_RE = /[_-]([a-z])/gi;
const SNAKE_CASE_RE = /([a-z0-9])([A-Z])/g;

const toCamelCase = (value: string) =>
  value.replace(CAMEL_CASE_RE, (_, letter: string) => letter.toUpperCase());

const toSnakeCase = (value: string) =>
  value.replace(SNAKE_CASE_RE, '$1_$2').replace(/-/g, '_').toLowerCase();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const transformKeys = <T>(
  value: T,
  transformKey: (key: string) => string,
): T => {
  if (Array.isArray(value)) {
    return value.map((item) => transformKeys(item, transformKey)) as T;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      transformKey(key),
      transformKeys(nested, transformKey),
    ]),
  ) as T;
};

const keysToCamelCase = <T>(value: T): T => transformKeys(value, toCamelCase);

const keysToSnakeCase = <T>(value: T): T => transformKeys(value, toSnakeCase);

export { keysToCamelCase, keysToSnakeCase };
