export type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

export type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;

export type Accepts<TFunction extends (...args: any[]) => any, TArgs extends unknown[]> = TArgs extends Parameters<TFunction> ? true : false;

export function assertType<T extends true>(): T | undefined {
	return undefined;
}
