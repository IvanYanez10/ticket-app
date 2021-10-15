import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError{
  statusCode = 500;
  reason = 'Error connecting to database';
  constructor(public errors: ValidationError[]){
    super('Error connecting to db');
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeError(){
    return [{ message: this.reason }];
  }

}