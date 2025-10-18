import { PayMongoWebhookEvent } from '@/modules/payments/types/paymongo-types';
import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaJson {
    type CostBreakdown = {
      category: string;
      name: string;
      cost: Prisma.Decimal;
    }[];

    /**
     * Defines a single performance level within a criterion (e.g., "Exemplary").
     * The scoreValue is the input the grader selects.
     */
    type RubricCriterionLevel = {
      /** The value assigned if this level is chosen (e.g., 4 on a 1-4 scale). */
      scoreValue: number;
      /** The descriptive name of the level (e.g., "Exemplary", "Proficient"). */
      name: string;
      /** The detailed descriptor text the grader uses to assess the work. */
      description: string;
    };

    /**
     * Defines a single grading criterion in a weighted analytic rubric.
     * This structure is used within the criteriaJson field of the RubricTemplate model.
     */
    type RubricCriterion = {
      /** A unique identifier for the criterion (e.g., "crit-001"). */
      id: string;
      /** The short name of the criterion (e.g., "Clarity & Focus"). */
      name: string;
      /** A longer explanation of what the criterion measures. */
      description: string;
      /**
       * The percentage weight this criterion contributes to the final assignment score.
       * NOTE: The sum of weightPercentage across all criteria must equal 100.
       */
      weightPercentage: number;
      /** An array of performance levels available for this criterion. */
      levels: RubricCriterionLevel[];
    };

    /**
     * Defines the structure for a single entry in the GradeRecord.rubricEvaluationDetails Json[] array.
     * This is the *output* structure after a submission is graded.
     */
    type RubricEvaluationDetail = {
      /** The ID of the criterion from the template that was graded. */
      criterionId: string;
      /** The name of the criterion that was graded (e.g., "Clarity & Focus"). */
      criterionName: string;
      /** The raw score the grader selected (e.g., 3). */
      selectedScoreValue: number;
      /** The maximum possible raw score for this criterion (e.g., 4). */
      maxScoreValue: number;
      /** The percentage weight of this criterion (e.g., 40). */
      weightPercentage: number;
      /** The descriptive text the grader selected (the descriptor of the chosen level). */
      selectedDescriptor: string;
      /** Calculated contribution of this criterion to the final assignment percentage (e.g., 30%). */
      weightedContributionPercent: number;
      /** Optional: Specific comment left by the grader for this criterion. */
      raterComment?: string;
    };

    type PayMongoData = PayMongoWebhookEvent | null;
  }
}

//Rubric Example:
//[
//   {
//     "id": "crit-001",
//     "name": "Clarity & Focus",
//     "description": "Assesses the main idea, thesis, and adherence to the prompt.",
//     "weightPercentage": 40, // <-- CRITICAL: This criterion contributes 40% of the total assignment score.
//     "levels": [
//       {
//         "scoreValue": 4, // The base value assigned by the rater (e.g., 1-4 scale)
//         "name": "Exemplary",
//         "description": "Thesis is crystal clear, arguable, and addresses all aspects of the prompt."
//       },
//       {
//         "scoreValue": 3,
//         "name": "Proficient",
//         "description": "Thesis is clear and addresses most aspects of the prompt."
//       },
//       {
//         "scoreValue": 2,
//         "name": "Developing",
//         "description": "Thesis is vague, or only addresses some parts of the prompt."
//       },
//       {
//         "scoreValue": 1,
//         "name": "Beginning",
//         "description": "No clear thesis statement is present or it is irrelevant."
//       }
//     ]
//   },
//   {
//     "id": "crit-002",
//     "name": "Evidence & Support",
//     "description": "Assesses the quality, relevance, and integration of supporting material.",
//     "weightPercentage": 40, // <-- CRITICAL: This criterion also contributes 40% of the total score.
//     "levels": [
//       // Same scoreValue and name structure as above
//       { "scoreValue": 4, "name": "Exemplary", "description": "Uses diverse, highly relevant evidence integrated seamlessly." },
//       { "scoreValue": 3, "name": "Proficient", "description": "Uses relevant evidence that supports all major claims." },
//       { "scoreValue": 2, "name": "Developing", "description": "Evidence is sparse or not directly relevant to the claims." },
//       { "scoreValue": 1, "name": "Beginning", "description": "Claims are unsupported or evidence is misused." }
//     ]
//   },
//   {
//     "id": "crit-003",
//     "name": "Mechanics & Style",
//     "description": "Assesses grammar, spelling, punctuation, and overall readability.",
//     "weightPercentage": 20, // <-- CRITICAL: This contributes 20% of the total score.
//     "levels": [
//       // Same scoreValue and name structure as above
//       { "scoreValue": 4, "name": "Exemplary", "description": "Error-free and highly polished, enhancing readability." },
//       { "scoreValue": 3, "name": "Proficient", "description": "Few minor errors that do not impede comprehension." },
//       { "scoreValue": 2, "name": "Developing", "description": "Frequent errors that distract the reader." },
//       { "scoreValue": 1, "name": "Beginning", "description": "Errors are pervasive, making the text difficult to read." }
//     ]
//   }
// ]

export {};
