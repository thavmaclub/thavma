export interface Assessment {
  id: number;
  creator: string;
  name: string;
  pwd: string;
  date: Date;
  questions: Question[];
}

export interface Question {
  question: string;
  answers: string[];
  answer: number | null;
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
  cus: string;
  sub: string | null;
  phone: string | null;
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
