export function createQueueState(initialItems = []) {
  let items = [...initialItems];
  let index = items.length ? 0 : -1;

  const normalizeIndex = (candidate) => {
    if (!items.length) return -1;
    return ((candidate % items.length) + items.length) % items.length;
  };

  return {
    add(nextItems) {
      const wasEmpty = items.length === 0;
      items.push(...nextItems);
      if (wasEmpty && items.length) index = 0;
      return this.snapshot();
    },
    replace(nextItems) {
      items = [...nextItems];
      index = items.length ? 0 : -1;
      return this.snapshot();
    },
    current() {
      return index >= 0 ? items[index] : null;
    },
    next() {
      index = normalizeIndex(index + 1);
      return this.current();
    },
    previous() {
      index = normalizeIndex(index - 1);
      return this.current();
    },
    select(nextIndex) {
      if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= items.length) return null;
      index = nextIndex;
      return this.current();
    },
    snapshot() {
      return { items: [...items], index, current: this.current() };
    },
  };
}
