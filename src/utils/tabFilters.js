export class TabFilters {
  constructor() {
    this._items = Object.freeze([
      { value: "for-you", label: "For you" },
      { value: "following", label: "Following" }
    ]);

    Object.freeze(this);
  }

  all() {
    return this._items;
  }

  getFirst() {
    return this._items[0];
  }

  firstValue() {
    return this._items[0]["value"]
  }

  firstLabel() {
    return this._items[0]["label"]
  }
  getSecond() {
    return this._items[0];
  }

  secondValue() {
    return this._items[0]["value"]
  }

  secondLabel() {
    return this._items[0]["label"]
  }
}
