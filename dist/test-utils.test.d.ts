type AssertEqual<T, Expected> = [T] extends [Expected] ? ([Expected] extends [T] ? true : false) : false;
/**
 * Assert that two types are equal
 * F.e. assertType<true, true>() // passes
 * assertType<true, false>() // fails
 */
export declare function assertType<T, Expected>(..._: AssertEqual<T, Expected> extends true ? [] : [`TYPES NOT EQUAL`]): void;
export {};
//# sourceMappingURL=test-utils.test.d.ts.map