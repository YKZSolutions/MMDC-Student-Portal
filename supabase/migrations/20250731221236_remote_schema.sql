create type "public"."Role" as enum ('student', 'mentor', 'admin');

create table "public"."User" (
    "id" uuid not null,
    "firstName" text not null,
    "middleName" text,
    "lastName" text not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "deletedAt" timestamp(3) without time zone,
    "role" "Role" not null
);


create table "public"."UserAccount" (
    "id" uuid not null,
    "userId" uuid not null,
    "authUid" text not null,
    "email" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "deletedAt" timestamp(3) without time zone
);


create table "public"."UserDetails" (
    "id" uuid not null,
    "userId" uuid not null,
    "dob" timestamp(3) without time zone,
    "gender" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "deletedAt" timestamp(3) without time zone
);


create table "public"."_prisma_migrations" (
    "id" character varying(36) not null,
    "checksum" character varying(64) not null,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) not null,
    "logs" text,
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone not null default now(),
    "applied_steps_count" integer not null default 0
);


CREATE UNIQUE INDEX "UserAccount_pkey" ON public."UserAccount" USING btree (id);

CREATE UNIQUE INDEX "UserAccount_userId_key" ON public."UserAccount" USING btree ("userId");

CREATE UNIQUE INDEX "UserDetails_pkey" ON public."UserDetails" USING btree (id);

CREATE UNIQUE INDEX "UserDetails_userId_key" ON public."UserDetails" USING btree ("userId");

CREATE UNIQUE INDEX "User_pkey" ON public."User" USING btree (id);

CREATE UNIQUE INDEX _prisma_migrations_pkey ON public._prisma_migrations USING btree (id);

alter table "public"."User" add constraint "User_pkey" PRIMARY KEY using index "User_pkey";

alter table "public"."UserAccount" add constraint "UserAccount_pkey" PRIMARY KEY using index "UserAccount_pkey";

alter table "public"."UserDetails" add constraint "UserDetails_pkey" PRIMARY KEY using index "UserDetails_pkey";

alter table "public"."_prisma_migrations" add constraint "_prisma_migrations_pkey" PRIMARY KEY using index "_prisma_migrations_pkey";

alter table "public"."UserAccount" add constraint "UserAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."UserAccount" validate constraint "UserAccount_userId_fkey";

alter table "public"."UserDetails" add constraint "UserDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."UserDetails" validate constraint "UserDetails_userId_fkey";


