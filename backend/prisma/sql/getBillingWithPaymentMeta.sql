-- @param {PaymentScheme} $1:paymentScheme? If full or installment
-- @param {BillType} $2:billType? The type of the bill (e.g. administrative)
-- @param {String} $3:status? If unpaid, paid, or overpaid
-- @param {String} $4:search? Search the bills by payer name, payer email, or invoice id
-- @param {String} $5:userId? Will return the user's bills if user id is present, else return all bills
SELECT COUNT(*)::bigint as count
FROM (
  SELECT bill.id
  FROM "Bill" bill
  LEFT JOIN "BillPayment" payment ON payment."billId" = bill.id
  WHERE
    ($1::"PaymentScheme" IS NULL OR bill."paymentScheme" = $1::"PaymentScheme")
    AND ($2::"BillType" IS NULL OR bill."billType" = $2::"BillType")
    AND ($5::uuid IS NULL OR bill."userId" = $5::uuid)
    AND (
      $4::text IS NULL OR (
        CAST(bill."invoiceId" AS TEXT) = $4::text
        OR bill."payerName" ILIKE '%' || $4 || '%'
        OR bill."payerEmail" ILIKE '%' || $4 || '%'
      )
    )
  GROUP BY bill.id
  HAVING (
    $3::text IS NULL OR (
      CASE
        WHEN COALESCE(SUM(payment."amountPaid"), 0) = 0 THEN 'unpaid'
        WHEN COALESCE(SUM(payment."amountPaid"), 0) < bill."totalAmount" THEN 'unpaid'
        WHEN COALESCE(SUM(payment."amountPaid"), 0) = bill."totalAmount" THEN 'paid'
        ELSE 'overpaid'
      END = $3
    )
  )
) AS subquery;