import { isString } from "class-validator";

console.log("Awesome");

export class MyAwesome {
  awesome;

  constructor(awesome) {
    if (isString(awesome)) {
      this.awesome = awesome;
    }
  }
}
