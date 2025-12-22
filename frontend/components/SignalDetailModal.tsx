"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, MapPin, Building, AlertTriangle, CheckCircle, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SignalDetail {
  id: string;
  source: string;
  signal_id: string;
  title: string | null;
  content: string;
  url: string | null;
  keyword_urgency: number;
  keyword_budget: number;
  keyword_authority: number;
  keyword_pain: number;
  keyword_total: number;
  ai_urgency: number | null;
  ai_budget: number | null;
  ai_authority: number | null;
  ai_pain: number | null;
  ai_total: number | null;
  ai_tier: string | null;
  sentiment: string | null;
  intent: string | null;
  lead_quality: string | null;
  key_indicators: string[] | null;
  recommended_action: string | null;
  ai_reasoning: string | null;
  location: string | null;
  company_mentioned: string | null;
  problem_type: string | null;
  processed: boolean;
  alerted: boolean;
  created_at: string;
}

interface SignalDetailModalProps {
  signalId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SignalDetailModal({ signalId, isOpen, onClose }: SignalDetailModalProps) {
  const [signal, setSignal] = useState<SignalDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (signalId && isOpen) {
      fetchSignalDetail();
    }
  }, [signalId, isOpen]);

  const fetchSignalDetail = async () => {
    if (!signalId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/signals/${signalId}`);
      const data = await response.json();
      setSignal(data);
    } catch (error) {
      console.error("Failed to fetch signal detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsAlerted = async () => {
    if (!signalId) return;
    try {
      await fetch(`${API_URL}/api/admin/signals/${signalId}/mark-alerted`, { method: "POST" });
      if (signal) setSignal({ ...signal, alerted: true });
    } catch (error) {
      console.error("Failed to mark as alerted:", error);
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case "hot": return "bg-red-500";
      case "warm": return "bg-orange-500";
      case "qualified": return "bg-yellow-500";
      case "cold": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-red-600";
    if (score >= 6) return "text-orange-600";
    if (score >= 4) return "text-yellow-600";
    return "text-gray-600";
  };

  if (!signal && !loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8"><p>Loading...</p></div>
        ) : signal ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl mb-2">{signal.title || "Untitled Signal"}</DialogTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{signal.source}</Badge>
                    {signal.ai_tier && <Badge className={`${getTierColor(signal.ai_tier)} text-white`}>{signal.ai_tier}</Badge>}
                    {signal.alerted ? <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Alerted</Badge> : <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div>
                <h3 className="font-semibold mb-2">Content</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{signal.content}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3">Keyword Scores</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Urgency:</span><span className={getScoreColor(signal.keyword_urgency)}>{signal.keyword_urgency}/10</span></div>
                    <div className="flex justify-between"><span>Budget:</span><span className={getScoreColor(signal.keyword_budget)}>{signal.keyword_budget}/10</span></div>
                    <div className="flex justify-between"><span>Authority:</span><span className={getScoreColor(signal.keyword_authority)}>{signal.keyword_authority}/10</span></div>
                    <div className="flex justify-between"><span>Pain:</span><span className={getScoreColor(signal.keyword_pain)}>{signal.keyword_pain}/10</span></div>
                    <Separator />
                    <div className="flex justify-between font-bold"><span>Total:</span><span>{signal.keyword_total}/100</span></div>
                  </div>
                </div>

                {signal.ai_total && (
                  <div>
                    <h3 className="font-semibold mb-3">AI Scores</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Urgency:</span><span className={getScoreColor(signal.ai_urgency || 0)}>{signal.ai_urgency}/10</span></div>
                      <div className="flex justify-between"><span>Budget:</span><span className={getScoreColor(signal.ai_budget || 0)}>{signal.ai_budget}/10</span></div>
                      <div className="flex justify-between"><span>Authority:</span><span className={getScoreColor(signal.ai_authority || 0)}>{signal.ai_authority}/10</span></div>
                      <div className="flex justify-between"><span>Pain:</span><span className={getScoreColor(signal.ai_pain || 0)}>{signal.ai_pain}/10</span></div>
                      <Separator />
                      <div className="flex justify-between font-bold"><span>Total:</span><span>{Math.round(signal.ai_total)}/100</span></div>
                    </div>
                  </div>
                )}
              </div>

              {signal.ai_reasoning && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">AI Analysis</h3>
                    <div className="space-y-2">
                      {signal.sentiment && <div><span className="font-medium">Sentiment:</span> <Badge variant="outline">{signal.sentiment}</Badge></div>}
                      {signal.intent && <div><span className="font-medium">Intent:</span> <Badge variant="outline">{signal.intent.replace(/_/g, " ")}</Badge></div>}
                      {signal.lead_quality && <div><span className="font-medium">Lead Quality:</span> <Badge variant="outline">{signal.lead_quality}</Badge></div>}
                      {signal.recommended_action && <div><span className="font-medium">Recommended Action:</span> <Badge className="bg-blue-600 text-white">{signal.recommended_action.replace(/_/g, " ")}</Badge></div>}
                    </div>
                    <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded">{signal.ai_reasoning}</p>
                  </div>
                </>
              )}

              {signal.key_indicators && signal.key_indicators.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Key Indicators</h3>
                    <div className="flex flex-wrap gap-2">
                      {signal.key_indicators.map((indicator, idx) => (
                        <Badge key={idx} variant="secondary">{indicator}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Metadata</h3>
                <div className="space-y-2 text-sm">
                  {signal.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{signal.location}</div>}
                  {signal.company_mentioned && <div className="flex items-center gap-2"><Building className="h-4 w-4" />{signal.company_mentioned}</div>}
                  {signal.problem_type && <div><span className="font-medium">Problem Type:</span> {signal.problem_type}</div>}
                  <div><span className="font-medium">Created:</span> {new Date(signal.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex gap-2">
                {signal.url && (
                  <Button asChild variant="outline">
                    <a href={signal.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />View Source
                    </a>
                  </Button>
                )}
                {!signal.alerted && (
                  <Button onClick={markAsAlerted}>
                    <CheckCircle className="mr-2 h-4 w-4" />Mark as Alerted
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
