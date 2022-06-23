class RangedType {

    constructor(min_range, max_range, init_value = 0) {
      this.min_range = min_range;
      this.max_range = max_range;
      this.init_value = init_value;
    }
    // Getter
    get area() {
      return this.calcArea();
    }
    // Method
    calcArea() {
      return this.height * this.width;
    }
  }