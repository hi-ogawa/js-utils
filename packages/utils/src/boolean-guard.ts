// convenient typing for array.filter(BooleanGuard)
// cf. https://github.com/microsoft/TypeScript/issues/31164

type BooleanGuard = <T>(
  value: T
) => value is Exclude<T, false | 0 | "" | null | undefined>;

/**
 * @deprecated use typedBoolean
 */
export const booleanGuard = Boolean as unknown as BooleanGuard;

export const typedBoolean = booleanGuard;
