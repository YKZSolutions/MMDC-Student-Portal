CREATE OR REPLACE VIEW "StudentAssignmentsSubmissions" AS
SELECT
    -- User info
    u.id AS user_id,
    u."firstName",
    u."lastName",

    -- Course info
    c.id AS course_id,
    c."courseCode",
    c.name AS course_name,

    -- Offering info
    co.id AS course_offering_id,
    ep."startYear",
    ep."endYear",
    ep.term,

    -- Module info
    m.id AS module_id,
    m.title AS module_title,

    -- Assignment info
    mc.id AS module_content_id,
    mc.title AS assignment_title,
    mc.content AS assignment_description,
    a."dueDate",
    a.points AS max_points,
    a.type AS assignment_type,
    a.status AS assignment_status,
    a."allowResubmission",
    a."maxAttempts",

    -- Latest submission (if exists)
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

    -- Grader info
    grader.id AS grader_id,
    grader."firstName" AS grader_first_name,
    grader."lastName" AS grader_last_name,

    -- Progress info
    cp."completedAt" AS content_completed_at,

    -- Timestamps
    mc."publishedAt" AS assignment_published_at,
    mc."createdAt" AS assignment_created_at,

    -- Dashboard helper
    CASE WHEN s.id IS NULL THEN true ELSE false END AS is_todo

FROM "User" u
         JOIN "CourseEnrollment" ce
              ON u.id = ce."studentId"
         JOIN "CourseOffering" co
              ON ce."courseOfferingId" = co.id
         JOIN "EnrollmentPeriod" ep
              ON co."periodId" = ep.id
         JOIN "Course" c
              ON co."courseId" = c.id

-- Modules
         LEFT JOIN "Module" m
                   ON (m."courseOfferingId" = co.id
                       OR (m."courseOfferingId" IS NULL AND m."courseId" = c.id))

-- Assignments
         JOIN "ModuleContent" mc
              ON m.id = mc."moduleId"
         JOIN "Assignment" a
              ON mc.id = a."moduleContentId"

-- Latest submission (per assignment & student)
         LEFT JOIN LATERAL (
    SELECT *
    FROM "Submission" s2
    WHERE s2."moduleContentId" = mc.id
      AND s2."studentId" = u.id
    ORDER BY s2."attemptNumber" DESC, s2."submittedAt" DESC
    LIMIT 1
    ) s ON true

-- Grader
         LEFT JOIN "User" grader
                   ON s."gradedBy" = grader.id

-- Progress
         LEFT JOIN "ContentProgress" cp
                   ON mc.id = cp."moduleContentId"
                       AND u.id = cp."userId"

WHERE
    mc."publishedAt" IS NOT NULL
  AND mc."publishedAt" <= NOW()
  AND mc."contentType" = 'ASSIGNMENT'
  AND ep.status = 'active'
  AND NOW() BETWEEN ep."startDate" AND ep."endDate"
  AND ce.status IN ('enrolled', 'completed');
