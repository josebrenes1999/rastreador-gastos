-- CreateTable
CREATE TABLE "Gasto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monto" REAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL
);
