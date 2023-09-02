CREATE TABLE "counter" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "counter_pkey" PRIMARY KEY ("id")
);
INSERT INTO "counter" (id, value) VALUES (1, 0);
