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

export class MultipleChoiceQuestionDto {
  id: string;
  type: string;
  points: number;
  question: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
}

export class ShortAnswerQuestionDto {
  id: string;
  type: string;
  points: number;
  question: string;
  maxLength: number;
}

export class TrueFalseQuestionDto {
  id: string;
  type: string;
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
