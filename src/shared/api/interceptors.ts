const camelCase = (value: string) => {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

const transformKeys = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map(transformKeys) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        camelCase(key),
        transformKeys(value),
      ]),
    ) as T;
  }

  return value;
};

export { transformKeys };
