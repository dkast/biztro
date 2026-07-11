-- CreateIndex
CREATE INDEX "Customer_membershipId_idx" ON "Customer"("membershipId");

-- CreateIndex
CREATE INDEX "Organization_subdomain_idx" ON "Organization"("subdomain");

-- CreateIndex
CREATE INDEX "Subscription_membershipId_idx" ON "Subscription"("membershipId");
