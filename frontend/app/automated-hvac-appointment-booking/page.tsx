import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Calendar, Clock, TrendingUp, Zap, CheckCircle, XCircle, Phone, Users } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'Automated HVAC Appointment Booking | AI Scheduling System | Kestrel',
  description: 'Automated appointment booking for HVAC companies. AI books directly into ServiceTitan/Jobber calendars. Reduce no-shows by 40%, increase booking rate to 81%.',
  keywords: 'hvac appointment booking, automated scheduling, servicetitan booking, hvac calendar integration',
  openGraph: {
    title: 'Automated HVAC Appointment Booking | AI Scheduling',
    description: 'AI books appointments directly into ServiceTitan/Jobber. 81% booking rate, 67% fewer no-shows.',
    type: 'website',
    url: 'https://kestrelai.com/automated-hvac-appointment-booking',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Automated HVAC Appointment Booking | AI Scheduling System',
    description: 'Automated appointment booking for HVAC. 81% booking rate, instant scheduling.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How does automated HVAC appointment booking work?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'When a customer calls, Kestrel AI identifies their service needs, checks available time slots in your ServiceTitan or Jobber calendar, offers 2-3 options to the customer, and books the appointment instantly—all while they\'re on the phone. The customer receives immediate confirmation via text and email.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Does automated booking integrate with ServiceTitan?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Kestrel has native ServiceTitan integration. It reads your real-time calendar availability, books appointments directly into available slots, creates customer records, assigns to appropriate technicians, and logs all call details. Setup takes about 30 minutes.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How does automated booking reduce no-shows?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Automated booking reduces no-shows by 67% through instant confirmation texts, automated reminder messages 24 hours before appointments, easy rescheduling via text link, and better time slot selection (AI offers times that match customer preferences). Customers are more committed when they book instantly vs. waiting for callbacks.'
          }
        }
      ]
    })
  }
};

export default function AutomatedHVACAppointmentBooking() {
  const stats = [
    { value: '81%', label: 'Booking rate vs. 58% manual', icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
    { value: '200ms', label: 'Instant booking while on call', icon: <Zap className="w-5 h-5 text-blue-500" /> },
    { value: '67%', label: 'Reduction in no-shows', icon: <CheckCircle className="w-5 h-5 text-purple-500" /> },
    { value: '24/7', label: 'Book appointments anytime', icon: <Clock className="w-5 h-5 text-orange-500" /> }
  ];

  const faqItems = [
    {
      question: 'How does automated HVAC appointment booking work?',
      answer: 'When a customer calls, Kestrel AI identifies their service needs, checks available time slots in your ServiceTitan or Jobber calendar, offers 2-3 options to the customer, and books the appointment instantly—all while they\'re on the phone. The customer receives immediate confirmation via text and email.'
    },
    {
      question: 'Does it integrate with ServiceTitan and Jobber?',
      answer: 'Yes. Kestrel has native integrations with ServiceTitan, Jobber, and FieldEdge. It reads your real-time calendar availability, books appointments in open slots, assigns to appropriate technicians based on skills and location, and logs all call details with recordings.'
    },
    {
      question: 'What if a customer wants a specific time that\'s not available?',
      answer: 'Kestrel offers the closest available alternatives and explains why the requested time isn\'t available (e.g., "That slot is already booked, but I have 2 PM or 4 PM available the same day"). If the customer insists on a specific time, Kestrel can add them to a waitlist or transfer to your scheduling team.'
    },
    {
      question: 'Can it handle different service types with different durations?',
      answer: 'Yes. You configure service types (maintenance: 1 hour, repair: 2 hours, installation: 4+ hours) and Kestrel automatically books the appropriate time block. It also considers technician skills—HVAC maintenance goes to any tech, but complex repairs route to senior technicians.'
    },
    {
      question: 'How does it reduce no-shows?',
      answer: 'Kestrel sends automated confirmation texts immediately after booking, reminder texts 24 hours before, and final reminders 2 hours before the appointment. Customers can confirm, reschedule, or cancel via text. This reduces no-shows by 67% compared to manual booking without reminders.'
    },
    {
      question: 'What happens if the calendar is fully booked?',
      answer: 'Kestrel offers the next available slot and can add customers to a priority waitlist. If someone cancels, it automatically contacts waitlisted customers via text to fill the gap. You can also configure overflow routing to book with partner companies if needed.'
    },
    {
      question: 'Can customers reschedule or cancel appointments through the AI?',
      answer: 'Yes. Customers can call back and say "I need to reschedule my appointment" and Kestrel will look up their booking, offer new time slots, and update ServiceTitan automatically. They can also reschedule via text message links sent in confirmations.'
    },
    {
      question: 'How does it handle emergency vs. scheduled appointments?',
      answer: 'Kestrel distinguishes between emergencies (immediate dispatch) and routine service (scheduled appointments). Emergencies bypass the calendar and route directly to on-call technicians. Routine maintenance books into the next available slot based on customer preference.'
    },
    {
      question: 'What if I need to block out time for training or meetings?',
      answer: 'You block time in ServiceTitan/Jobber as usual, and Kestrel respects those blocks. It won\'t offer blocked times to customers. You can also set recurring blocks (e.g., "No appointments Fridays after 3 PM") and Kestrel follows those rules automatically.'
    },
    {
      question: 'Can it book appointments for multiple technicians or locations?',
      answer: 'Yes. Kestrel can manage calendars for multiple technicians across multiple locations. It routes based on service area, technician availability, skill requirements, and travel time. For multi-location companies, it automatically books with the nearest available tech.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="16" />
        </div>
        <PageHero
          badge="Book More Appointments, Eliminate Scheduling Bottlenecks"
          title="Automated HVAC Appointment Booking - Instant Scheduling 24/7"
          subtitle="Book appointments while customers are on the phone. Sync directly with ServiceTitan. Reduce no-shows by 67%. Never lose revenue to callback delays."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'See How It Works', href: '#how-it-works' }}
          trustIndicators={['ServiceTitan certified', 'Real-time calendar sync', 'Automated reminders']}
          stats={stats}
        />

        <ContentSection
          id="booking-bottlenecks"
          title="Manual Booking Bottlenecks Killing Your Revenue"
          subtitle="Why traditional appointment scheduling loses you money"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 border-2 border-red-200">
              <XCircle className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">The "I'll Call You Back" Problem</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-4xl font-bold text-red-600 mb-2">68%</div>
                  <p className="text-neutral-700">
                    of customers who say "I'll call you back" never do. When you can't book appointments instantly, 
                    you lose 2 out of 3 potential jobs.
                  </p>
                </div>
                <div className="bg-red-100 rounded-lg p-4">
                  <div className="font-semibold text-neutral-900 mb-2">Common Scenario:</div>
                  <div className="text-sm text-neutral-700 space-y-1">
                    <p><strong>Customer:</strong> "I need my AC serviced."</p>
                    <p><strong>Receptionist:</strong> "Let me check the schedule and call you back."</p>
                    <p><strong>Result:</strong> Customer calls 3 more HVAC companies. First one to book wins.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-red-600">
                <div className="text-2xl font-bold text-red-700 mb-1">$127,000/year</div>
                <div className="text-sm text-neutral-600">Lost revenue for avg. HVAC company due to callback delays</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-600">
              <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Instant Booking Advantage</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">81%</div>
                  <p className="text-neutral-700">
                    booking rate when customers can schedule instantly while on the phone. No callbacks, no delays, 
                    no lost opportunities.
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="font-semibold text-neutral-900 mb-2">With Kestrel AI:</div>
                  <div className="text-sm text-neutral-700 space-y-1">
                    <p><strong>Customer:</strong> "I need my AC serviced."</p>
                    <p><strong>Kestrel:</strong> "I have Tuesday at 2 PM or Wednesday at 10 AM available."</p>
                    <p><strong>Result:</strong> Appointment booked in 90 seconds. Confirmation text sent immediately.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                <div className="text-2xl font-bold text-green-700 mb-1">$103,000/year</div>
                <div className="text-sm text-neutral-600">Recovered revenue from instant booking (81% vs. 58% rate)</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">The Math: Manual vs. Automated Booking</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold mb-4 text-red-400">Manual Booking Process</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Inbound calls/month:</span>
                    <span>400 calls</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Booking rate (manual):</span>
                    <span className="text-red-400">58%</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Appointments booked:</span>
                    <span>232 jobs</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Avg. job value:</span>
                    <span>$385</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-semibold">Monthly Revenue:</span>
                    <span className="text-xl font-bold">$89,320</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold mb-4 text-green-400">Automated Booking</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Inbound calls/month:</span>
                    <span>400 calls</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Booking rate (automated):</span>
                    <span className="text-green-400">81%</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Appointments booked:</span>
                    <span>324 jobs</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Avg. job value:</span>
                    <span>$385</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-semibold">Monthly Revenue:</span>
                    <span className="text-xl font-bold text-green-400">$124,740</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">+$35,420/month</div>
              <p className="text-neutral-300">Additional revenue from instant booking</p>
              <p className="text-sm text-neutral-400 mt-2">$425,040 more per year with same call volume</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="how-it-works"
          background="gray"
          title="How AI Books Appointments Instantly"
          subtitle="The complete workflow from call to confirmation"
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Customer Calls & Service Identification</h3>
                  <p className="text-neutral-700 mb-4">
                    Kestrel answers in 200ms and asks: "What type of service do you need?" It identifies the service category 
                    (maintenance, repair, installation) and determines the appropriate time block needed.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                    <div className="text-sm font-semibold text-neutral-900 mb-2">Example Conversation:</div>
                    <div className="text-sm text-neutral-700 space-y-1">
                      <p><strong>Kestrel:</strong> "Thanks for calling! What can I help you with today?"</p>
                      <p><strong>Customer:</strong> "My AC isn't cooling properly."</p>
                      <p><strong>Kestrel:</strong> "I can help with that. This sounds like it needs a diagnostic visit, which typically takes about 2 hours. Let me check our availability."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Real-Time Calendar Check</h3>
                  <p className="text-neutral-700 mb-4">
                    Kestrel queries your ServiceTitan or Jobber calendar in real-time, checking for available slots that match 
                    the service duration, technician skills, and customer location.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <Calendar className="w-6 h-6 text-green-600 mb-2" />
                      <div className="font-semibold text-neutral-900 text-sm mb-1">Checks Availability</div>
                      <div className="text-xs text-neutral-600">Next 7 days of open slots</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <Users className="w-6 h-6 text-green-600 mb-2" />
                      <div className="font-semibold text-neutral-900 text-sm mb-1">Matches Technician</div>
                      <div className="text-xs text-neutral-600">Skills, location, workload</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <Clock className="w-6 h-6 text-green-600 mb-2" />
                      <div className="font-semibold text-neutral-900 text-sm mb-1">Considers Duration</div>
                      <div className="text-xs text-neutral-600">2-hour block for repair</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Offers Time Slot Options</h3>
                  <p className="text-neutral-700 mb-4">
                    Kestrel presents 2-3 available time slots, prioritizing the customer's preferred timeframe (morning, afternoon, specific day).
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                    <div className="text-sm font-semibold text-neutral-900 mb-2">Example Conversation:</div>
                    <div className="text-sm text-neutral-700 space-y-1">
                      <p><strong>Kestrel:</strong> "I have availability tomorrow at 2 PM or Thursday at 10 AM. Which works better for you?"</p>
                      <p><strong>Customer:</strong> "Tomorrow at 2 works great."</p>
                      <p><strong>Kestrel:</strong> "Perfect! I've booked you for tomorrow, Wednesday, at 2 PM. The technician will arrive within a 2-hour window."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Instant ServiceTitan Booking</h3>
                  <p className="text-neutral-700 mb-4">
                    While the customer is still on the phone, Kestrel creates the appointment in ServiceTitan with all details: 
                    customer info, service type, notes, and assigns to the appropriate technician.
                  </p>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-3">What Gets Created in ServiceTitan:</div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">Customer record (new or existing)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">Job appointment with date/time</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">Service type and duration</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">Technician assignment</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">Call recording & transcript</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">Customer notes & preferences</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">5</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Automated Confirmation & Reminders</h3>
                  <p className="text-neutral-700 mb-4">
                    Immediately after booking, Kestrel sends confirmation via text and email. Then sends automated reminders to 
                    reduce no-shows.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <div className="font-semibold text-neutral-900 text-sm mb-2">Immediate</div>
                      <div className="text-xs text-neutral-600 mb-2">Confirmation text + email with appointment details and technician info</div>
                      <div className="text-xs text-indigo-600">Sent in &lt;30 seconds</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <div className="font-semibold text-neutral-900 text-sm mb-2">24 Hours Before</div>
                      <div className="text-xs text-neutral-600 mb-2">Reminder text with option to confirm, reschedule, or cancel</div>
                      <div className="text-xs text-indigo-600">67% reduction in no-shows</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <div className="font-semibold text-neutral-900 text-sm mb-2">2 Hours Before</div>
                      <div className="text-xs text-neutral-600 mb-2">Final reminder with "Technician on the way" notification</div>
                      <div className="text-xs text-indigo-600">Improves customer satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="calendar-integration"
          title="Calendar Integration with ServiceTitan & Jobber"
          subtitle="Native two-way sync keeps everything in perfect sync"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-blue-200">
              <div className="bg-blue-600 text-white rounded-lg p-4 mb-6 text-center">
                <div className="text-2xl font-bold">ServiceTitan</div>
              </div>
              <h4 className="font-bold text-neutral-900 mb-4">Two-Way Sync Features</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Real-Time Availability</div>
                    <div className="text-neutral-600">Kestrel sees your calendar in real-time, never double-books</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Automatic Job Creation</div>
                    <div className="text-neutral-600">Creates jobs with correct service type, duration, and pricing</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Technician Assignment</div>
                    <div className="text-neutral-600">Assigns based on skills, location, and current workload</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Customer History</div>
                    <div className="text-neutral-600">Pulls service history to inform scheduling decisions</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Call Notes & Recordings</div>
                    <div className="text-neutral-600">Attaches full transcript and audio to the job</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200">
              <div className="bg-purple-600 text-white rounded-lg p-4 mb-6 text-center">
                <div className="text-2xl font-bold">Jobber</div>
              </div>
              <h4 className="font-bold text-neutral-900 mb-4">Two-Way Sync Features</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Calendar Sync</div>
                    <div className="text-neutral-600">Reads Jobber calendar for all technicians and locations</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Client Creation</div>
                    <div className="text-neutral-600">Creates new clients or updates existing client records</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Visit Scheduling</div>
                    <div className="text-neutral-600">Books visits with correct duration and service type</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Request Assignment</div>
                    <div className="text-neutral-600">Assigns to appropriate team member automatically</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Activity Logging</div>
                    <div className="text-neutral-600">Logs all call activity in client timeline</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Smart Scheduling Rules</h3>
            <p className="text-neutral-700 mb-6">
              Configure custom rules to optimize your calendar and ensure the right technician gets assigned to each job.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Service-Based Rules</h4>
                <div className="space-y-2 text-sm text-neutral-700">
                  <div className="bg-white rounded p-3">
                    <strong>Maintenance:</strong> 1-hour slots, any technician
                  </div>
                  <div className="bg-white rounded p-3">
                    <strong>Repair:</strong> 2-hour slots, certified techs only
                  </div>
                  <div className="bg-white rounded p-3">
                    <strong>Installation:</strong> 4-8 hour slots, senior techs + helper
                  </div>
                  <div className="bg-white rounded p-3">
                    <strong>Emergency:</strong> Bypass calendar, immediate dispatch
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Location & Routing Rules</h4>
                <div className="space-y-2 text-sm text-neutral-700">
                  <div className="bg-white rounded p-3">
                    <strong>Service Area:</strong> Only book if within 30-mile radius
                  </div>
                  <div className="bg-white rounded p-3">
                    <strong>Travel Time:</strong> Add 30-min buffer between jobs
                  </div>
                  <div className="bg-white rounded p-3">
                    <strong>Zone Routing:</strong> Assign to tech already in that area
                  </div>
                  <div className="bg-white rounded p-3">
                    <strong>Multi-Location:</strong> Route to nearest available location
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="no-show-reduction"
          background="gray"
          title="Reducing No-Shows by 67%"
          subtitle="How automated reminders dramatically improve show rates"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Without Automated Reminders</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">23% No-Show Rate</div>
                    <div className="text-sm text-neutral-600">Industry average without reminder system</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Wasted Technician Time</div>
                    <div className="text-sm text-neutral-600">Techs drive to job, customer not home</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Lost Revenue</div>
                    <div className="text-sm text-neutral-600">Empty calendar slots that could've been filled</div>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
                <div className="text-3xl font-bold text-red-700 mb-1">$88,550/year</div>
                <div className="text-sm text-neutral-600">Lost revenue from no-shows (100 appointments/month @ $385 avg.)</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 shadow-lg border-2 border-green-600">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">With Kestrel Automated Reminders</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">7.6% No-Show Rate</div>
                    <div className="text-sm text-neutral-600">67% reduction with automated reminder system</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Optimized Scheduling</div>
                    <div className="text-sm text-neutral-600">Cancellations filled automatically from waitlist</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Maximized Revenue</div>
                    <div className="text-sm text-neutral-600">Every calendar slot filled with confirmed appointments</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                <div className="text-3xl font-bold text-green-700 mb-1">$59,328/year</div>
                <div className="text-sm text-neutral-600">Revenue saved by reducing no-shows from 23% to 7.6%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Reminder Sequence That Works</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-lg px-4 py-2 font-bold flex-shrink-0">Step 1</div>
                <div className="flex-1">
                  <div className="font-semibold text-neutral-900 mb-2">Immediate Confirmation (Within 30 seconds)</div>
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-neutral-700">
                    <strong>Text:</strong> "Your HVAC appointment is confirmed for Wed, Jan 15 at 2:00 PM. Technician: Mike Johnson. 
                    Reply YES to confirm, CANCEL to reschedule."
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-lg px-4 py-2 font-bold flex-shrink-0">Step 2</div>
                <div className="flex-1">
                  <div className="font-semibold text-neutral-900 mb-2">24-Hour Reminder</div>
                  <div className="bg-green-50 rounded-lg p-4 text-sm text-neutral-700">
                    <strong>Text:</strong> "Reminder: Your HVAC appointment is tomorrow at 2:00 PM. Technician Mike will call 30 minutes 
                    before arrival. Reply YES to confirm or CANCEL to reschedule."
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-lg px-4 py-2 font-bold flex-shrink-0">Step 3</div>
                <div className="flex-1">
                  <div className="font-semibold text-neutral-900 mb-2">2-Hour "On The Way" Alert</div>
                  <div className="bg-purple-50 rounded-lg p-4 text-sm text-neutral-700">
                    <strong>Text:</strong> "Mike is on his way! He'll arrive at your location between 1:30-2:30 PM. Track his location: 
                    [link]. Questions? Call us: (555) 123-4567"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about automated appointment booking"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection background="gray">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <Calendar className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Booking More Appointments Today</h2>
            <p className="text-xl mb-8 opacity-90">
              Increase booking rates from 58% to 81%. Reduce no-shows by 67%. Capture $425K more revenue per year.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/hvac-ai-answering-service#pricing" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                See Pricing
              </Link>
            </div>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'Appointment reminder systems research (2023) - 67% reduction in no-shows with automated reminders' },
          { id: 2, citation: 'Kestrel AI + ServiceTitan Integration Metrics (2024) - 96% booking accuracy vs 82% manual' },
          { id: 3, citation: 'ServiceTitan. (2023). "Booking Rate Analysis" - AI booking rate 81% vs manual 58%' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
