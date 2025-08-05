export class CardDetailsPaymongoDto {
  card_number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  bank_code?: string;
}
