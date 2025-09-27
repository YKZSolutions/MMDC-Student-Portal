// Base question interface with common properties
interface BaseQuestionDto {
  id: string;
  type: QuizQuestionType;
  points: number;
  question: string;
  explanation?: string;
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
  required?: boolean;
  tags?: string[];
}

export type QuizQuestionType =
  | 'multiple_choice'
  | 'multiple_answer'
  | 'true_false'
  | 'matching'
  | 'ordering'
  | 'fill_in_blank'
  | 'short_answer'
  | 'essay';

// Multiple Choice Question
// Single correct answer from multiple options
export interface MultipleChoiceQuestionDto extends BaseQuestionDto {
  type: 'multiple_choice';
  options: {
    id: string;
    text: string;
    correct: boolean;
    feedback?: string;
  }[];
  shuffleOptions?: boolean;
}

// Multiple Answer Question
// Multiple correct answers from multiple options
export interface MultipleAnswerQuestionDto extends BaseQuestionDto {
  type: 'multiple_answer';
  options: {
    id: string;
    text: string;
    correct: boolean;
    feedback?: string;
  }[];
  partialCredit?: boolean; // Whether to give partial credit for partially correct answers
  shuffleOptions?: boolean;
}

// True/False Question
export interface TrueFalseQuestionDto extends BaseQuestionDto {
  type: 'true_false';
  correctAnswer: boolean;
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
}

// Matching Question
// Match items from one column to another
export interface MatchingQuestionDto extends BaseQuestionDto {
  type: 'matching';
  matches: {
    id: string;
    item: string;
    matches: {
      id: string;
      text: string;
    }[];
    correctMatchId: string;
    feedback?: string;
  }[];
  shuffleItems?: boolean;
  shuffleMatches?: boolean;
}

// Ordering Question
// Put items in the correct order
export interface OrderingQuestionDto extends BaseQuestionDto {
  type: 'ordering';
  items: {
    id: string;
    text: string;
    correctPosition: number;
  }[];
  partialCredit?: 'none' | 'partial' | 'all_or_nothing';
  shuffleItems?: boolean;
}

// Fill in the Blank Question
// Fill in one or more blanks in text
export interface FillInBlankQuestionDto extends BaseQuestionDto {
  type: 'fill_in_blank';
  content: Array<{
    type: 'text' | 'blank';
    content?: string; // For text type
    id?: string; // For blank type
    correctAnswers?: string[]; // For blank type
    caseSensitive?: boolean; // For blank type
    feedback?: string; // For blank type
  }>;
  partialCredit?: boolean;
}

// Short Answer Question
// Short text response
export interface ShortAnswerQuestionDto extends BaseQuestionDto {
  type: 'short_answer';
  maxLength: number;
  expectedAnswer?: string;
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
  allowPartialCredit?: boolean;
  // For more complex matching
  matchType?: 'exact' | 'contains' | 'regex';
  // For regex matching
  matchPattern?: string;
}

// Essay Question
// Long form text response
export interface EssayQuestionDto extends BaseQuestionDto {
  type: 'essay';
  minWords?: number;
  maxWords?: number;
  maxLength: number;
  // // For automated checking
  // checkPlagiarism?: boolean;
  // // For AI-assisted grading
  // aiGradingEnabled?: boolean;
  // // For rubrics
  // rubric?: {
  //   criteria: Array<{
  //     id: string;
  //     description: string;
  //     points: number;
  //   }>;
  // };
}

// Union type of all possible question types
export type QuizQuestionDto =
  | MultipleChoiceQuestionDto
  | MultipleAnswerQuestionDto
  | TrueFalseQuestionDto
  | MatchingQuestionDto
  | OrderingQuestionDto
  | FillInBlankQuestionDto
  | ShortAnswerQuestionDto
  | EssayQuestionDto;
