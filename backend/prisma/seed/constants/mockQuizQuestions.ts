import {
  MultipleChoiceQuestionDto,
  ShortAnswerQuestionDto,
  TrueFalseQuestionDto,
} from '../../../src/modules/lms/content/quiz/dto/quiz-questions.dto';


export const mockMultipleChoiceQuestionDto: MultipleChoiceQuestionDto = {
  questionNumber: 1,
  type: 'multiple_choice',
  points: 5,
  question: 'What is the capital of France?',
  options: [
    { id: 'a', text: 'London', correct: false },
    { id: 'b', text: 'Paris', correct: true },
    { id: 'c', text: 'Berlin', correct: false },
  ],
};

export const mockShortAnswerQuestionDto: ShortAnswerQuestionDto = {
  questionNumber: 2,
  type: 'short_answer',
  points: 10,
  question: 'Explain the theory of relativity',
  maxLength: 500,
};

export const mockTrueFalseQuestionDto: TrueFalseQuestionDto = {
  questionNumber: 3,
  type: 'true_false',
  points: 10,
  question: 'Is the theory of relativity correct?',
  options: [
    { id: 'a', text: 'True', correct: true },
    { id: 'b', text: 'False', correct: false },
  ],
};

export const mockQuizQuestions = [
  mockMultipleChoiceQuestionDto,
  mockShortAnswerQuestionDto,
  mockTrueFalseQuestionDto,
];
