SELECT
  u.id AS user_id,
  u."firstName",
  u."lastName",
  c.id AS course_id,
  c."courseCode",
  c.name AS course_name,
  co.id AS course_offering_id,
  ep."startYear",
  ep."endYear",
  ep.term,
  m.id AS module_id,
  m.title AS module_title,
  mc.id AS module_content_id,
  mc.title AS assignment_title,
  mc.content AS assignment_description,
  a."dueDate",
  a.points AS max_points,
  a.type AS assignment_type,
  a.status AS assignment_status,
  a."allowResubmission",
  a."maxAttempts",
  s.id AS submission_id,
  s.title AS submission_title,
  s.submission AS submission_content,
  s.score,
  s.grade,
  s.feedback,
  s."attemptNumber",
  s."lateDays",
  s."submittedAt",
  s."gradedAt",
  grader.id AS grader_id,
  grader."firstName" AS grader_first_name,
  grader."lastName" AS grader_last_name,
  cp."completedAt" AS content_completed_at,
  mc."publishedAt" AS assignment_published_at,
  mc."createdAt" AS assignment_created_at,
  CASE
    WHEN (s.id IS NULL) THEN TRUE
    ELSE false
  END AS is_todo
FROM
  (
    (
      (
        (
          (
            (
              (
                (
                  (
                    (
                      "User" u
                      JOIN "CourseEnrollment" ce ON ((u.id = ce."studentId"))
                    )
                    JOIN "CourseOffering" co ON ((ce."courseOfferingId" = co.id))
                  )
                  JOIN "EnrollmentPeriod" ep ON ((co."periodId" = ep.id))
                )
                JOIN "Course" c ON ((co."courseId" = c.id))
              )
              LEFT JOIN "Module" m ON (
                (
                  (m."courseOfferingId" = co.id)
                  OR (
                    (m."courseOfferingId" IS NULL)
                    AND (m."courseId" = c.id)
                  )
                )
              )
            )
            JOIN "ModuleContent" mc ON ((m.id = mc."moduleId"))
          )
          JOIN "Assignment" a ON ((mc.id = a."moduleContentId"))
        )
        LEFT JOIN LATERAL (
          SELECT
            s2.id,
            s2.title,
            s2.submission,
            s2.score,
            s2.grade,
            s2.feedback,
            s2."attemptNumber",
            s2."lateDays",
            s2."submittedAt",
            s2."gradedAt",
            s2."moduleContentId",
            s2."studentId",
            s2."gradedBy",
            s2."createdAt",
            s2."updatedAt",
            s2."deletedAt"
          FROM
            "Submission" s2
          WHERE
            (
              (s2."moduleContentId" = mc.id)
              AND (s2."studentId" = u.id)
            )
          ORDER BY
            s2."attemptNumber" DESC,
            s2."submittedAt" DESC
          LIMIT
            1
        ) s ON (TRUE)
      )
      LEFT JOIN "User" grader ON ((s."gradedBy" = grader.id))
    )
    LEFT JOIN "ContentProgress" cp ON (
      (
        (mc.id = cp."moduleContentId")
        AND (u.id = cp."userId")
      )
    )
  )
WHERE
  (
    (mc."publishedAt" IS NOT NULL)
    AND (mc."publishedAt" <= NOW())
    AND (mc."contentType" = 'ASSIGNMENT' :: "ContentType")
    AND (ep.status = 'active' :: "EnrollmentStatus")
    AND (
      (NOW() >= ep."startDate")
      AND (NOW() <= ep."endDate")
    )
    AND (
      ce.status = ANY (
        ARRAY ['enrolled'::"CourseEnrollmentStatus", 'completed'::"CourseEnrollmentStatus"]
      )
    )
  );