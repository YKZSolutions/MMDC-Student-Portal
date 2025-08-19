-- @param {Int} $1:limit Number of entries each page
-- @param {Int} $2:offset The current page number
-- @param {BillType} $3:billType? If full or installment
-- @param {String} $4:status? If unpaid, paid, or overpaid
-- @param {String} $5:search? Search the bills by payer name, payer email, or invoice id
-- @param {String} $6:userId? Will return the user's bills if user id is present, else return all bills
-- @param {String} $7:orderBy?  Column name to order by (e.g., 'createdAt', 'amountToPay')
-- @param {String} $8:orderDir Order direction ('asc' or 'desc')
WITH bills AS (
  SELECT 
    bill.id,
    bill."invoiceId",
    bill."payerName",
    bill."payerEmail",
    bill."billType",
    bill."amountToPay",
    bill."dueAt",
    bill."issuedAt",
    bill."createdAt",
    bill."updatedAt",
    bill."deletedAt",
    COALESCE(SUM(payment."amountPaid"), 0) AS "totalPaid",
    CASE
      WHEN COALESCE(SUM(payment."amountPaid"), 0) = 0 THEN 'unpaid'
      WHEN COALESCE(SUM(payment."amountPaid"), 0) < bill."amountToPay" THEN 'partial'
      WHEN COALESCE(SUM(payment."amountPaid"), 0) = bill."amountToPay" THEN 'paid'
      ELSE 'overpaid'
    END AS "status"
  FROM "Bill" bill
  LEFT JOIN "BillPayment" payment ON payment."billId" = bill.id
  WHERE
    ($3::"BillType" IS NULL OR bill."billType" = $3::"BillType")
    AND ($6::uuid IS NULL OR bill."userId" = $6::uuid)
    AND (
      $5::text IS NULL OR (
        CAST(bill."invoiceId" AS TEXT) = $5::text
        OR bill."payerName" ILIKE '%' || $5 || '%'
        OR bill."payerEmail" ILIKE '%' || $5 || '%'
      )
    )
  GROUP BY bill.id
  HAVING (
    $4::text IS NULL OR (
      CASE
        WHEN COALESCE(SUM(payment."amountPaid"), 0) = 0 THEN 'unpaid'
        WHEN COALESCE(SUM(payment."amountPaid"), 0) < bill."amountToPay" THEN 'partial'
        WHEN COALESCE(SUM(payment."amountPaid"), 0) = bill."amountToPay" THEN 'paid'
        ELSE 'overpaid'
      END = $4
    )
  )
)
SELECT *
FROM bills
ORDER BY
  (CASE WHEN $7 = 'createdAt'  AND $8 = 'asc'  THEN bills."createdAt"  END) ASC,
  (CASE WHEN $7 = 'createdAt'  AND $8 = 'desc' THEN bills."createdAt"  END) DESC,
  (CASE WHEN $7 = 'dueAt'      AND $8 = 'asc'  THEN bills."dueAt"      END) ASC,
  (CASE WHEN $7 = 'dueAt'      AND $8 = 'desc' THEN bills."dueAt"      END) DESC,
  (CASE WHEN $7 = 'amountToPay' AND $8 = 'asc'  THEN bills."amountToPay" END) ASC,
  (CASE WHEN $7 = 'amountToPay' AND $8 = 'desc' THEN bills."amountToPay" END) DESC,
  (CASE WHEN $7 = 'totalPaid'   AND $8 = 'asc'  THEN bills."totalPaid"   END) ASC,
  (CASE WHEN $7 = 'totalPaid'   AND $8 = 'desc' THEN bills."totalPaid"   END) DESC
LIMIT $1
OFFSET $2;
