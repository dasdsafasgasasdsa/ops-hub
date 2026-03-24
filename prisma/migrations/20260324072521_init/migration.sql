-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "payload" JSONB,
    "readyAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "task_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "queuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "workerId" TEXT,
    "errorMessage" TEXT,
    "output" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "task_runs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "runId" TEXT,
    "eventType" TEXT NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_events_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_events_runId_fkey" FOREIGN KEY ("runId") REFERENCES "task_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_artifacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "runId" TEXT,
    "kind" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_artifacts_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_artifacts_runId_fkey" FOREIGN KEY ("runId") REFERENCES "task_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "runId" TEXT,
    "requestedBy" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedBy" TEXT,
    "decidedAt" DATETIME,
    "reason" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "approvals_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "approvals_runId_fkey" FOREIGN KEY ("runId") REFERENCES "task_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "execution_locks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "acquiredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "releasedAt" DATETIME,
    "metadata" JSONB
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tasks_key_key" ON "tasks"("key");

-- CreateIndex
CREATE INDEX "tasks_status_priority_readyAt_createdAt_idx" ON "tasks"("status", "priority", "readyAt", "createdAt");

-- CreateIndex
CREATE INDEX "tasks_priority_createdAt_idx" ON "tasks"("priority", "createdAt");

-- CreateIndex
CREATE INDEX "task_runs_status_queuedAt_createdAt_idx" ON "task_runs"("status", "queuedAt", "createdAt");

-- CreateIndex
CREATE INDEX "task_runs_taskId_createdAt_idx" ON "task_runs"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "task_runs_taskId_status_createdAt_idx" ON "task_runs"("taskId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "task_events_taskId_createdAt_idx" ON "task_events"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "task_events_runId_createdAt_idx" ON "task_events"("runId", "createdAt");

-- CreateIndex
CREATE INDEX "task_artifacts_taskId_createdAt_idx" ON "task_artifacts"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "task_artifacts_runId_createdAt_idx" ON "task_artifacts"("runId", "createdAt");

-- CreateIndex
CREATE INDEX "approvals_taskId_requestedAt_idx" ON "approvals"("taskId", "requestedAt");

-- CreateIndex
CREATE INDEX "approvals_runId_requestedAt_idx" ON "approvals"("runId", "requestedAt");

-- CreateIndex
CREATE INDEX "approvals_decision_requestedAt_idx" ON "approvals"("decision", "requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "execution_locks_name_key" ON "execution_locks"("name");

-- CreateIndex
CREATE INDEX "execution_locks_expiresAt_idx" ON "execution_locks"("expiresAt");

-- CreateIndex
CREATE INDEX "execution_locks_releasedAt_expiresAt_idx" ON "execution_locks"("releasedAt", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
