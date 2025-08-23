-- @param {PaymentScheme} $1:paymentScheme? If full or installment
-- @param {String} $2:status? If unpaid, paid, or overpaid
-- @param {String} $3:search? Search the bills by payer name, payer email, or invoice id
-- @param {String} $4:userId? Will return the user's bills if user id is present, else return all bills
SELECT COUNT(*)::bigint as count
FROM (
  SELECT bill.id
  FROM "Bill" bill
  LEFT JOIN "BillPayment" payment ON payment."billId" = bill.id
  WHERE
    ($1::"PaymentScheme" IS NULL OR bill."paymentScheme" = $1::"PaymentScheme")
    AND ($4::uuid IS NULL OR bill."userId" = $4::uuid)
    AND (
      $3::text IS NULL OR (
        CAST(bill."invoiceId" AS TEXT) = $3::text
        OR bill."payerName" ILIKE '%' || $3 || '%'
        OR bill."payerEmail" ILIKE '%' || $3 || '%'
      )
    )
  GROUP BY bill.id
  HAVING (
    $2::text IS NULL OR (
      CASE
        WHEN COALESCE(SUM(payment."amountPaid"), 0) = 0 THEN 'unpaid'
        WHEN COALESCE(SUM(payment."amountPaid"), 0) < bill."totalAmount" THEN 'unpaid'
        WHEN COALESCE(SUM(payment."amountPaid"), 0) = bill."totalAmount" THEN 'paid'
        ELSE 'overpaid'
      END = $2
    )
  )
) AS subquery;