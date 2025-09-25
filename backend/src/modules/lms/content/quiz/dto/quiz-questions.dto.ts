//     "id": "q1",
//     "type": "multiple_choice",
//     "points": 5,
//     "question": "What is the capital of France?",
//     "options": [
//       {"id": "a", "text": "London", "correct": false},
//       {"id": "b", "text": "Paris", "correct": true},
//       {"id": "c", "text": "Berlin", "correct": false}
//     ]
//   },
//   {
//     "id": "q2",
//     "type": "short_answer",
//     "points": 10,
//     "question": "Explain the theory of relativity",
//     "maxLength": 500
//   }

export type QuizQuestionType =
  | 'multiple_choice'
  | 'short_answer'
  | 'true_false';

export class MultipleChoiceQuestionDto {
  questionNumber: number;
  type: QuizQuestionType;
  points: number;
  question: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
}

export class ShortAnswerQuestionDto {
  questionNumber: number;
  type: QuizQuestionType;
  points: number;
  question: string;
  maxLength: number;
}

export class TrueFalseQuestionDto {
  questionNumber: number;
  type: QuizQuestionType;
  points: number;
  question: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
}
export type QuizQuestionDto =
  | MultipleChoiceQuestionDto
  | ShortAnswerQuestionDto
  | TrueFalseQuestionDto;
