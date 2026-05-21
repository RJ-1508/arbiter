/*
  Warnings:

  - A unique constraint covering the columns `[currentLocationId]` on the table `games` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId]` on the table `players` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "games_currentLocationId_key" ON "games"("currentLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "players_gameId_key" ON "players"("gameId");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
