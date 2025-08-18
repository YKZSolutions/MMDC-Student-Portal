export type MetaParams = Record<number, string>;

export type ExtractedArgs<A, P extends Record<number, string>> = {
  [K in keyof P as P[K] & string]: A[Extract<K, keyof A>];
};

export const extractArgs = <A extends any[], P extends Record<number, string>>(
  params: P,
  args: A,
): ExtractedArgs<A, P> => {
  const output: any = {};

  for (const key in params) {
    output[params[key] as string] = args[Number(key) as keyof A];
  }

  return output;
};
