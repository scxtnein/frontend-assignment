export class ErrorAlreadyExists extends Error {
  constructor() {
    super('Email already exists');
  }
}
