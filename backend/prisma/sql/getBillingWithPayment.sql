-- @param {Int} $1:limit Number of entries each page
-- @param {Int} $2:offset The current page number
-- @param {PaymentScheme} $3:paymentScheme? If full or installment
-- @param {BillType} $4:billType? The type of the bill (e.g. administrative)
-- @param {String} $5:status? If unpaid, paid, or overpaid
-- @param {String} $6:search? Search the bills by payer name, payer email, or invoice id
-- @param {String} $7:userId? Will return the user's bills if user id is present, else return all bills
-- @param {String} $8:orderBy?  Column name to order by (e.g., 'createdAt', 'amountToPay')
-- @param {String} $9:orderDir Order direction ('asc' or 'desc')
-- @param {Boolean} $10:isDeleted If the retrieved items are deleted or not
WITH bills AS (
  SELECT bill.id,
    bill."invoiceId",
    bill."payerName",
    bill."payerEmail",
    bill."paymentScheme",
    bill."billType",
    bill."totalAmount",
    bill."createdAt",
    bill."updatedAt",
    bill."deletedAt",
    COALESCE(SUM(payment."amountPaid"), 0) AS "totalPaid",
    CASE
      WHEN COALESCE(SUM(payment."amountPaid"), 0) = 0 THEN 'unpaid'
      WHEN COALESCE(SUM(payment."amountPaid"), 0) < bill."totalAmount" THEN 'partial'
      WHEN COALESCE(SUM(payment."amountPaid"), 0) = bill."totalAmount" THEN 'paid'
      ELSE 'overpaid'
    END AS "status",
    (
      SELECT COUNT(*)
      FROM "BillInstallment" i
      WHERE i."billId" = bill.id
    ) AS "totalInstallments",
    (
      SELECT COUNT(*)
      FROM (
          SELECT i.id
          FROM "BillInstallment" i
            LEFT JOIN "BillPayment" p ON p."installmentId" = i.id
          WHERE i."billId" = bill.id
          GROUP BY i.id
          HAVING COALESCE(SUM(p."amountPaid"), 0) >= i."amountToPay"
        ) sub
    ) AS "paidInstallments",
    (
      SELECT array_agg(
          i."dueAt"
          ORDER BY i."dueAt"
        )
      FROM "BillInstallment" i
      WHERE i."billId" = bill.id
    ) AS "installmentDueDates"
  FROM "Bill" bill
    LEFT JOIN "BillPayment" payment ON payment."billId" = bill.id
  WHERE (
      $3::"PaymentScheme" IS NULL
      OR bill."paymentScheme" = $3::"PaymentScheme"
    )
    AND (
      $4::"BillType" IS NULL
      OR bill."billType" = $4::"BillType"
    )
    AND (
      $7::uuid IS NULL
      OR bill."userId" = $7::uuid
    )
    AND (
      $6::text IS NULL
      OR (
        CAST(bill."invoiceId" AS TEXT) = $6::text
        OR bill."payerName" ILIKE '%' || $6 || '%'
        OR bill."payerEmail" ILIKE '%' || $6 || '%'
      )
    )
    AND (
      $10::boolean IS NULL
      OR (
        $10 = TRUE
        AND bill."deletedAt" IS NOT NULL
      )
      OR (
        $10 = FALSE
        AND bill."deletedAt" IS NULL
      )
    )
  GROUP BY bill.id
  HAVING (
      $5::text IS NULL
      OR (
        CASE
          WHEN COALESCE(SUM(payment."amountPaid"), 0) = 0 THEN 'unpaid'
          WHEN COALESCE(SUM(payment."amountPaid"), 0) < bill."totalAmount" THEN 'partial'
          WHEN COALESCE(SUM(payment."amountPaid"), 0) = bill."totalAmount" THEN 'paid'
          ELSE 'overpaid'
        END = $5
      )
    )
)
SELECT *
FROM bills
ORDER BY (
    CASE
      WHEN $8 = 'createdAt'
      AND $9 = 'asc' THEN bills."createdAt"
    END
  ) ASC,
  (
    CASE
      WHEN $8 = 'createdAt'
      AND $9 = 'desc' THEN bills."createdAt"
    END
  ) DESC,
  (
    CASE
      WHEN $8 = 'totalAmount'
      AND $9 = 'asc' THEN bills."totalAmount"
    END
  ) ASC,
  (
    CASE
      WHEN $8 = 'totalAmount'
      AND $9 = 'desc' THEN bills."totalAmount"
    END
  ) DESC,
  (
    CASE
      WHEN $8 = 'totalPaid'
      AND $9 = 'asc' THEN bills."totalPaid"
    END
  ) ASC,
  (
    CASE
      WHEN $8 = 'totalPaid'
      AND $9 = 'desc' THEN bills."totalPaid"
    END
  ) DESC
LIMIT $1 OFFSET $2;