export interface FuncList<T> {
    head(): T;
    tail(): FuncList<T>;
}