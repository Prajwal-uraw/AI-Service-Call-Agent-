"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Zap, 
  RefreshCw, 
  FileText,
  CheckCircle,
  ArrowRight,
  Search,
  Loader2
} from "lucide-react";

export default function PhoneSetupPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  // Path A: Buy new number
  const [searchAreaCode, setSearchAreaCode] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  // Path B: Call forwarding
  const [existingNumber, setExistingNumber] = useState("");
  const [forwardToNumber, setForwardToNumber] = useState("");
  const [forwardingInstructions, setForwardingInstructions] = useState<any>(null);
  
  // Path C: Port-in
  const [portInData, setPortInData] = useState({
    phone_number: "",
    carrier: "",
    account_number: "",
    pin: ""
  });

  const handleSearchNumbers = async () => {
    setSearching(true);
    try {
      const response = await fetch("/api/twilio/search-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_code: searchAreaCode || undefined,
          limit: 10
        })
      });
      
      const data = await response.json();
      setAvailableNumbers(data.numbers || []);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setSearching(false);
  };

  const handlePurchaseNumber = async () => {
    if (!selectedNumber) return;
    
    setPurchasing(true);
    try {
      const response = await fetch("/api/twilio/purchase-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: selectedNumber,
          tenant_id: "demo_tenant", // Replace with actual tenant ID
          friendly_name: "AI Voice Agent"
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setStep(3); // Success
      }
    } catch (error) {
      console.error("Purchase failed:", error);
    }
    setPurchasing(false);
  };

  const handleSetupForwarding = async () => {
    try {
      const response = await fetch("/api/twilio/setup-forwarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: "demo_tenant",
          existing_number: existingNumber,
          forward_to_number: ""
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setForwardToNumber(data.forward_to_number);
        setForwardingInstructions(data.instructions);
        setStep(3);
      }
    } catch (error) {
      console.error("Forwarding setup failed:", error);
    }
  };

  const handleRequestPortIn = async () => {
    try {
      const response = await fetch("/api/twilio/request-port-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: "demo_tenant",
          ...portInData
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setStep(3);
      }
    } catch (error) {
      console.error("Port-in request failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Phone Setup</h1>
          <p className="text-gray-600">Choose how you want to set up your AI voice agent</p>
        </div>

        {step === 1 && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Path A: Buy New Number */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPath === "new" ? "border-2 border-blue-500" : ""
              }`}
              onClick={() => { setSelectedPath("new"); setStep(2); }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                </div>
                <CardTitle>Get New Number</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Get a new AI-powered phone number instantly. Live in under 2 minutes.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Instant activation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Choose your area code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>No setup complexity</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Path B: Forward Existing */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPath === "forward" ? "border-2 border-blue-500" : ""
              }`}
              onClick={() => { setSelectedPath("forward"); setStep(2); }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <RefreshCw className="h-8 w-8 text-purple-600" />
                  <Badge className="bg-purple-100 text-purple-800">Zero Risk</Badge>
                </div>
                <CardTitle>Use Existing Number</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Keep your current number. Just forward calls to our AI. Reversible anytime.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>Keep your number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>No carrier changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>Cancel anytime</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Path C: Port In */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPath === "port" ? "border-2 border-blue-500" : ""
              }`}
              onClick={() => { setSelectedPath("port"); setStep(2); }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-8 w-8 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-800">Advanced</Badge>
                </div>
                <CardTitle>Port Your Number</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Transfer your existing number to us. Takes 7-21 days. White-glove service.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <span>Keep exact number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <span>Full ownership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <span>Concierge support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && selectedPath === "new" && (
          <Card>
            <CardHeader>
              <CardTitle>Search Available Numbers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Area Code (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchAreaCode}
                    onChange={(e) => setSearchAreaCode(e.target.value)}
                    placeholder="e.g., 415, 212, 310"
                    className="flex-1 border rounded-lg px-4 py-2"
                    maxLength={3}
                  />
                  <Button onClick={handleSearchNumbers} disabled={searching}>
                    {searching ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...</>
                    ) : (
                      <><Search className="h-4 w-4 mr-2" /> Search</>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to see numbers from any area code
                </p>
              </div>

              {availableNumbers.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Available Numbers</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableNumbers.map((num) => (
                      <div
                        key={num.phone_number}
                        onClick={() => setSelectedNumber(num.phone_number)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedNumber === num.phone_number
                            ? "border-blue-500 bg-blue-50"
                            : "hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-lg">{num.phone_number}</p>
                            <p className="text-sm text-gray-600">
                              {num.locality}, {num.region}
                            </p>
                          </div>
                          {selectedNumber === num.phone_number && (
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handlePurchaseNumber}
                    disabled={!selectedNumber || purchasing}
                    className="w-full mt-4"
                  >
                    {purchasing ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Purchasing...</>
                    ) : (
                      <>Purchase Number <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && selectedPath === "forward" && (
          <Card>
            <CardHeader>
              <CardTitle>Set Up Call Forwarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Existing Phone Number
                </label>
                <input
                  type="tel"
                  value={existingNumber}
                  onChange={(e) => setExistingNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full border rounded-lg px-4 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The number customers currently call
                </p>
              </div>

              <Button onClick={handleSetupForwarding} className="w-full">
                Generate Forwarding Instructions <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> We'll give you a number to forward your calls to. 
                  Your customers keep calling your existing number, but our AI answers.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && selectedPath === "port" && (
          <Card>
            <CardHeader>
              <CardTitle>Request Number Port-In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Timeline:</strong> 7-21 business days. Our team will handle everything.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number to Port</label>
                <input
                  type="tel"
                  value={portInData.phone_number}
                  onChange={(e) => setPortInData({...portInData, phone_number: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Carrier</label>
                <select
                  value={portInData.carrier}
                  onChange={(e) => setPortInData({...portInData, carrier: e.target.value})}
                  aria-label="Select current carrier"
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select carrier...</option>
                  <option value="att">AT&T</option>
                  <option value="verizon">Verizon</option>
                  <option value="tmobile">T-Mobile</option>
                  <option value="sprint">Sprint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={portInData.account_number}
                  onChange={(e) => setPortInData({...portInData, account_number: e.target.value})}
                  placeholder="Your carrier account number"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">PIN (if applicable)</label>
                <input
                  type="text"
                  value={portInData.pin}
                  onChange={(e) => setPortInData({...portInData, pin: e.target.value})}
                  placeholder="Account PIN"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <Button onClick={handleRequestPortIn} className="w-full">
                Submit Port-In Request <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-2 border-green-500">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
              
              {selectedPath === "new" && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Your AI voice agent is live at <strong>{selectedNumber}</strong>
                  </p>
                  <Button onClick={() => window.location.href = "/dashboard"}>
                    Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {selectedPath === "forward" && forwardingInstructions && (
                <div className="space-y-4 text-left">
                  <p className="text-gray-600 text-center mb-4">
                    Forward your calls to: <strong>{forwardToNumber}</strong>
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Forwarding Instructions</h3>
                    {Object.entries(forwardingInstructions).map(([key, carrier]: [string, any]) => (
                      <div key={key} className="mb-4">
                        <p className="font-medium text-sm mb-2">{carrier.name}:</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          {carrier.steps.map((step: string, idx: number) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                  
                  <Button onClick={() => window.location.href = "/dashboard"} className="w-full">
                    Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {selectedPath === "port" && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Port-in request submitted. Our team will contact you within 24 hours.
                  </p>
                  <p className="text-sm text-gray-500">
                    Estimated completion: 7-21 business days
                  </p>
                  <Button onClick={() => window.location.href = "/dashboard"}>
                    Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
