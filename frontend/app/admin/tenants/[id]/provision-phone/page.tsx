"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { parseError, logError } from "@/lib/errors";
import { Phone, Search, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AvailableNumber {
  phone_number: string;
  friendly_name: string;
  locality: string;
  region: string;
  postal_code: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

export default function ProvisionPhonePage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id as string;

  const [areaCode, setAreaCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSearch = async () => {
    if (!areaCode || areaCode.length !== 3) {
      setError("Please enter a valid 3-digit area code");
      return;
    }

    setSearching(true);
    setError("");
    setAvailableNumbers([]);

    try {
      const response = await fetch(`${API_URL}/api/twilio/search-numbers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_code: areaCode,
          country: "US",
          limit: 20
        })
      });

      if (!response.ok) {
        throw new Error("Failed to search numbers");
      }

      const data = await response.json();
      setAvailableNumbers(data.numbers || []);

      if (data.numbers.length === 0) {
        setError(`No available numbers found for area code ${areaCode}`);
      }
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, "ProvisionPhonePage.handleSearch");
      setError(appError.userMessage);
    } finally {
      setSearching(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedNumber) {
      setError("Please select a number");
      return;
    }

    if (!confirm(`Purchase ${selectedNumber}? This will charge your Twilio account.`)) {
      return;
    }

    setPurchasing(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/twilio/purchase-number`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: selectedNumber,
          tenant_id: tenantId,
          friendly_name: `Voice Agent - Tenant ${tenantId}`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to purchase number");
      }

      const data = await response.json();
      setSuccess(true);

      setTimeout(() => {
        router.push(`/admin/tenants/${tenantId}`);
      }, 2000);
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, "ProvisionPhonePage.handlePurchase");
      setError(appError.userMessage);
    } finally {
      setPurchasing(false);
    }
  };

  if (success) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Phone Number Provisioned!</h2>
            <p className="text-slate-400">Redirecting to tenant details...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push(`/admin/tenants/${tenantId}`)}
            variant="outline"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Provision Phone Number</h1>
            <p className="text-slate-400 mt-1">Search and purchase a Twilio phone number</p>
          </div>
        </div>

        {error && <ErrorMessage message={error} type="error" dismissible onDismiss={() => setError("")} />}

        <Card className="bg-slate-800/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Search size={20} />
              Search Available Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Area Code
                </label>
                <input
                  type="text"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, "").substring(0, 3))}
                  placeholder="e.g., 857"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                  maxLength={3}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={searching || areaCode.length !== 3}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {searching ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="mr-2" size={16} />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {availableNumbers.length > 0 && (
          <Card className="bg-slate-800/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-slate-100">
                Available Numbers ({availableNumbers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableNumbers.map((number) => (
                  <div
                    key={number.phone_number}
                    onClick={() => setSelectedNumber(number.phone_number)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedNumber === number.phone_number
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-slate-700 hover:border-slate-600 bg-slate-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-mono font-bold text-slate-100">
                          {number.phone_number}
                        </p>
                        <p className="text-sm text-slate-400">
                          {number.locality}, {number.region} {number.postal_code}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {number.capabilities.voice && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                            Voice
                          </span>
                        )}
                        {number.capabilities.sms && (
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                            SMS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedNumber && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Selected Number</p>
                      <p className="text-xl font-mono font-bold text-slate-100">{selectedNumber}</p>
                    </div>
                    <Button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {purchasing ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Purchasing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2" size={16} />
                          Purchase Number
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <AlertCircle size={20} />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Numbers are purchased from your Twilio account</p>
            <p>• Webhooks will be automatically configured</p>
            <p>• The number will be immediately assigned to this tenant</p>
            <p>• Monthly cost: ~$1.15/month per number</p>
            <p>• You can release unused numbers anytime</p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
