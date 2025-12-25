


I think we need below too, do u disagree?

Engines You Are Missing (and Why They Matter)

I’ll group these by risk control, credibility, and scale leverage.

1. ❗ Baseline & Counterfactual Engine (MISSING, CRITICAL)
What’s missing

You model opportunity, but you don’t formally establish “before KV” behavior.

Right now, you rely on:

Industry benchmarks

Pilot-period observation

What’s missing is a declared baseline source.

Why this matters

Executives will ask:

“Compared to what?”

CFOs don’t reject models — they reject undefined baselines.

What this engine does

Stores baseline source:

Customer-reported

Historical call logs (if available)

Industry fallback

Tags every comparison with provenance

Minimal implementation
baseline_source: "customer_reported" | "historical_logs" | "industry_benchmark"
baseline_answer_rate: 0.62
baseline_booking_delay_hours: 24
baseline_notes: "Owner-reported avg"

Output used in report

“Compared to customer-reported baseline…”

“Compared to industry baseline where internal data was unavailable…”

This engine protects you legally and reputationally.

2. ❗ Assumptions & Disclosure Engine (MISSING, NON-NEGOTIABLE)
What’s missing

You compute assumptions inline — but you don’t track or version them.

This is dangerous at scale.

Why this matters

Without this engine:

Sales says one thing

Engineering changes logic

Reports drift

You lose trust silently

What this engine does

Central registry of:

Miss-rate assumptions

After-hours multipliers

Ticket-size sources

Versioned per pilot

Minimal implementation
assumptions: {
  peak_hour_miss_rate: 0.30,
  after_hours_miss_rate: 0.60,
  emergency_ticket_multiplier: 1.18,
  confidence_level: "conservative"
}
assumptions_version: "v1.0"

Output used in report

Appendix + footnotes + “conservative model” language.

This is enterprise hygiene.

3. ❗ Observed vs Modeled Segregation Engine (MISSING)
What’s missing

You compute observed and modeled values — but you don’t enforce separation.

Right now, this is implicit and human-dependent.

Why this matters

This is where lawsuits and trust erosion start.

What this engine does

Explicitly labels every metric as:

observed

modeled

derived

Prevents report generator from mixing them

Minimal schema
metric_type ENUM('observed', 'modeled', 'derived')
confidence_band ENUM('high', 'medium', 'low')

Impact

Report language stays clean

Guarantees never slip in accidentally

Allows PE-grade diligence later

4. ⚠️ Call Capacity Saturation Engine (MISSING, HIGH VALUE)
What’s missing

You detect leakage, but you don’t prove saturation.

Leakage ≠ capacity breach.

Why this matters

This engine turns:

“Calls were missed”
into
“Calls exceeded human capacity at X times”

That’s a much stronger ops argument.

What it does

Tracks concurrent calls

Compares to stated capacity

Flags saturation windows

Minimal logic
if concurrent_calls > declared_capacity:
    capacity_exceeded = True

Report value

Explains why calls are missed

Strengthens PE and ops buy-in

5. ⚠️ Latency & System Performance Engine (MISSING)
What’s missing

You market 200ms latency, but you don’t measure it per pilot.

Why this matters

Executives trust systems that measure their own claims.

What this engine does

Tracks:

Answer latency

Speech-to-response latency

Booking execution latency

Aggregates percentiles (P50 / P90)

Minimal outputs
answer_latency_ms_p50: 210
answer_latency_ms_p90: 280
streaming_health: "stable"

Report use

Optional appendix or “technical metrics” section.

This engine becomes a moat later