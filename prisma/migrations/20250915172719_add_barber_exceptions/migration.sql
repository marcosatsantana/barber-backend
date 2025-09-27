-- CreateTable
CREATE TABLE "public"."barber_exceptions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_blocked" BOOLEAN NOT NULL DEFAULT true,
    "barber_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barber_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "barber_exceptions_barber_id_date_idx" ON "public"."barber_exceptions"("barber_id", "date");

-- AddForeignKey
ALTER TABLE "public"."barber_exceptions" ADD CONSTRAINT "barber_exceptions_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
