declare global {
    interface Array<T> {
        consistingOf(o: T): Array<T>;
    }
}
