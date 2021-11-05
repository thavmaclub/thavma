export interface School {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Test {
  id: number;
  name: string;
  date: string;
  difficulty: string;
  content: string[];
  course: string;
}

export interface User {
  id: string;
  phone: string;
}

export interface Code {
  id: string;
  creator: string;
  user: string | null;
}

export class APIError extends Error {
  public constructor(message: string, public readonly code: number = 400) {
    super(message);
  }
}
