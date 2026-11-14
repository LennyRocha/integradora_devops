import { Error as MongoError } from 'mongoose';
import { MongoException } from '../exceptions/mongo-exception';

export const handleError = (error: unknown): never => {
  if (error instanceof MongoError) {
    throw new MongoException(error.message, error.name, error);
  }

  throw error;
};
