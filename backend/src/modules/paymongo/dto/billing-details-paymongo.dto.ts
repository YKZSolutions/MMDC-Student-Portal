export class BillingDetailsPaymongoDto {
  address?: {
    line1: string;
    line2: string;
    city: string;
    postal_code: string;
    country: string;
  };
  name?: 'string';
  email?: 'string';
  phone?: 'string';
}
