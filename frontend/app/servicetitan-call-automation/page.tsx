import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Zap, CheckCircle, Database, Calendar, Phone, Users, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';

export const metadata: Metadata = {
  title: 'ServiceTitan Call Automation | Native AI Integration | Kestrel',
  description: 'Native ServiceTitan integration for call automation. AI answers calls, books appointments, logs interactions automatically. Zero manual data entry.',
  keywords: 'servicetitan integration, servicetitan automation, hvac crm integration, call automation servicetitan',
  openGraph: {
    title: 'ServiceTitan Call Automation | Native AI Integration',
    description: 'Native ServiceTitan integration. AI books appointments, logs calls, syncs data automatically.',
    type: 'website',
    url: 'https://kestrelai.com/servicetitan-call-automation',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServiceTitan Call Automation | Native AI Integration',
    description: 'Native ServiceTitan integration for call automation. Zero manual data entry.',
  },
};

export default function ServiceTitanCallAutomation() {
  const stats = [
    { value: '30min', label: 'Setup time for integration', icon: <Clock className="w-5 h-5 text-blue-500" /> },
    { value: '100%', label: 'Two-way sync in real-time', icon: <Zap className="w-5 h-5 text-green-500" /> },
    { value: '0', label: 'Manual data entry required', icon: <CheckCircle className="w-5 h-5 text-purple-500" /> },
    { value: '81%', label: 'Booking rate with instant sync', icon: <TrendingUp className="w-5 h-5 text-orange-500" /> }
  ];

  const faqItems = [
    {
      question: 'How does Kestrel integrate with ServiceTitan?',
      answer: 'Kestrel has native ServiceTitan integration that syncs in real-time. When a call comes in, Kestrel automatically looks up the customer by phone number, retrieves their service history, checks calendar availability, books appointments in open slots, and logs all call details with recordings and transcripts—all while the customer is on the phone.'
    },
    {
      question: 'What ServiceTitan data does Kestrel access?',
      answer: 'Kestrel reads: customer records (name, address, phone, email), service history and past jobs, calendar availability for all technicians, pricing tiers and membership status, location/service area data, and technician skills and certifications. Kestrel writes: new customer records, appointment bookings, job notes, call recordings and transcripts, and customer communication logs.'
    },
    {
      question: 'How long does ServiceTitan integration take to set up?',
      answer: 'Most HVAC companies complete ServiceTitan integration in 30 minutes. We handle the OAuth authentication, configure field mappings, set up job types and durations, test with sample calls, and train you on the dashboard. No coding or technical knowledge required.'
    },
    {
      question: 'Does it work with ServiceTitan\'s new API?',
      answer: 'Yes. Kestrel uses ServiceTitan\'s latest API v2 with OAuth 2.0 authentication. We stay current with all ServiceTitan updates and API changes automatically, so you never need to worry about compatibility issues or breaking changes.'
    },
    {
      question: 'Can Kestrel book appointments in ServiceTitan automatically?',
      answer: 'Yes. Kestrel checks real-time calendar availability, offers 2-3 time slots to the customer, books the appointment in the selected slot, assigns to the appropriate technician based on skills and location, and sends confirmation texts/emails—all while the customer is on the phone. No manual entry required.'
    },
    {
      question: 'What if a customer already exists in ServiceTitan?',
      answer: 'Kestrel automatically looks up existing customers by phone number. If found, it retrieves their full history (past jobs, equipment, preferences, membership status) and uses that context during the call. For example: "I see you had your AC serviced 6 months ago. Are you calling about the same unit?"'
    },
    {
      question: 'How does it handle ServiceTitan job types?',
      answer: 'You configure your ServiceTitan job types in Kestrel (Maintenance: 1 hour, Repair: 2 hours, Installation: 4+ hours, etc.). When booking, Kestrel automatically selects the correct job type, books the appropriate time block, and assigns to technicians with the required skills.'
    },
    {
      question: 'Can it access ServiceTitan pricing and membership tiers?',
      answer: 'Yes. Kestrel can pull pricing from ServiceTitan and quote it to customers during calls. It also recognizes membership tiers (Gold, Platinum, etc.) and applies appropriate discounts or priority scheduling automatically.'
    },
    {
      question: 'What happens if ServiceTitan is down?',
      answer: 'Kestrel continues answering calls and collecting information. Once ServiceTitan is back online, all data syncs automatically. Customers never experience disruption. We also maintain local cache of critical data (customer info, calendar) for redundancy.'
    },
    {
      question: 'Does it work with multi-location ServiceTitan accounts?',
      answer: 'Yes. Kestrel can manage multiple ServiceTitan locations. It automatically routes calls to the correct location based on customer address or service area, checks availability across all locations, and books with the nearest available technician.'
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
          badge="Native ServiceTitan Integration"
          title="ServiceTitan Call Automation - Instant Booking & Two-Way Sync"
          subtitle="Native integration that books appointments, looks up customers, and logs calls automatically. Setup in 30 minutes with zero coding required."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'See Integration', href: '#how-it-works' }}
          trustIndicators={['ServiceTitan certified', '30-minute setup', 'Real-time two-way sync']}
          stats={stats}
        />

        <ContentSection
          id="what-it-does"
          title="What ServiceTitan Integration Does"
          subtitle="Complete automation of your call-to-booking workflow"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600">
              <Database className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Automatic Customer Lookup</h3>
              <p className="text-neutral-700 mb-4">
                When a call comes in, Kestrel instantly looks up the customer in ServiceTitan by phone number. Retrieves full 
                service history, equipment details, and membership status.
              </p>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-neutral-700">
                <strong>Example:</strong> "Hi John! I see you had your AC serviced 6 months ago. How can I help today?"
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-600">
              <Calendar className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Real-Time Appointment Booking</h3>
              <p className="text-neutral-700 mb-4">
                Checks ServiceTitan calendar availability in real-time, offers time slots to customer, and books appointments 
                instantly—all while they're on the phone.
              </p>
              <div className="bg-green-50 rounded-lg p-3 text-sm text-neutral-700">
                <strong>Result:</strong> 81% booking rate vs. 58% with manual callback scheduling
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-600">
              <Users className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Smart Technician Assignment</h3>
              <p className="text-neutral-700 mb-4">
                Assigns jobs to technicians based on skills, location, current workload, and service area. Considers travel 
                time and technician certifications.
              </p>
              <div className="bg-purple-50 rounded-lg p-3 text-sm text-neutral-700">
                <strong>Logic:</strong> HVAC install → Senior tech with EPA cert in customer's zone
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-600">
              <Phone className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Complete Call Logging</h3>
              <p className="text-neutral-700 mb-4">
                Every call is logged in ServiceTitan with full transcript, audio recording, sentiment analysis, and AI-generated 
                summary. Attached to customer record and job.
              </p>
              <div className="bg-orange-50 rounded-lg p-3 text-sm text-neutral-700">
                <strong>Benefit:</strong> Dispatchers see full context before calling customer back
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-600">
              <CheckCircle className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">New Customer Creation</h3>
              <p className="text-neutral-700 mb-4">
                For new callers, Kestrel automatically creates customer records in ServiceTitan with all contact info, service 
                address, and initial call notes.
              </p>
              <div className="bg-red-50 rounded-lg p-3 text-sm text-neutral-700">
                <strong>Time saved:</strong> 5-10 minutes per new customer (no manual entry)
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-600">
              <TrendingUp className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Membership Recognition</h3>
              <p className="text-neutral-700 mb-4">
                Recognizes ServiceTitan membership tiers (Gold, Platinum, etc.) and applies priority scheduling, discounts, 
                and special handling automatically.
              </p>
              <div className="bg-indigo-50 rounded-lg p-3 text-sm text-neutral-700">
                <strong>Example:</strong> "As a Platinum member, I can get you in today at 2 PM"
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="how-it-works"
          background="gray"
          title="How ServiceTitan Integration Works"
          subtitle="Complete workflow from call to ServiceTitan job creation"
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Call Comes In → Instant Customer Lookup</h3>
                  <p className="text-neutral-700 mb-4">
                    Kestrel answers in 200ms and immediately queries ServiceTitan by phone number. If customer exists, retrieves 
                    full profile. If new, prepares to create record.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">What Gets Retrieved:</div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-neutral-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Customer name, address, email</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Service history (last 5 jobs)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Equipment details (make, model, age)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Membership tier and status</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Outstanding invoices or credits</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Customer preferences and notes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Identify Service Need → Check Calendar</h3>
                  <p className="text-neutral-700 mb-4">
                    AI determines service type (maintenance, repair, installation) and required duration. Queries ServiceTitan 
                    calendar for available slots matching the service requirements.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">Calendar Query Logic:</div>
                    <div className="text-sm text-neutral-700 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Service Type:</span>
                        <span>AC Repair (2-hour block needed)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Location:</span>
                        <span>Customer in North Phoenix zone</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Skills Required:</span>
                        <span>EPA certified, AC specialist</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Available Slots:</span>
                        <span className="text-green-600">Tomorrow 10 AM, 2 PM, 4 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Offer Slots → Book Appointment</h3>
                  <p className="text-neutral-700 mb-4">
                    AI presents 2-3 available time slots to customer. Once they choose, instantly books in ServiceTitan with 
                    correct job type, duration, and technician assignment.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">What Gets Created in ServiceTitan:</div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-neutral-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Job with correct type (Repair)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Appointment date/time (Tomorrow 2 PM)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Technician assigned (Mike - EPA cert)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Duration blocked (2 hours)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Call notes with issue description</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Call recording and transcript attached</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Send Confirmations → Log Everything</h3>
                  <p className="text-neutral-700 mb-4">
                    Immediately sends confirmation text/email to customer. Logs all call activity in ServiceTitan customer 
                    timeline. Updates job with full context for technician.
                  </p>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">What Your Team Sees:</div>
                    <div className="text-sm text-neutral-700 space-y-2">
                      <div className="bg-white rounded p-3 border border-orange-200">
                        <strong>In ServiceTitan Job:</strong> Full call transcript, audio recording, customer sentiment (positive), 
                        AI summary ("Customer reports AC not cooling, outdoor unit running but no cold air"), and recommended parts 
                        (capacitor, contactor)
                      </div>
                      <div className="bg-white rounded p-3 border border-orange-200">
                        <strong>In Customer Timeline:</strong> "Inbound call answered by AI - AC repair scheduled for tomorrow 2 PM 
                        with Mike. Customer satisfied with service."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="setup"
          title="ServiceTitan Integration Setup"
          subtitle="Live in 30 minutes with our white-glove onboarding"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">What We Configure</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-neutral-900">OAuth Authentication</div>
                    <div className="text-sm text-neutral-600">Secure connection to your ServiceTitan account</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Job Type Mapping</div>
                    <div className="text-sm text-neutral-600">Map your ServiceTitan job types to call scenarios</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Technician Skills</div>
                    <div className="text-sm text-neutral-600">Import technician certifications and service areas</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Business Rules</div>
                    <div className="text-sm text-neutral-600">Configure booking windows, buffer times, service areas</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Test Calls</div>
                    <div className="text-sm text-neutral-600">Run sample calls to verify everything works perfectly</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 shadow-lg border-2 border-green-600">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">What You Provide</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">ServiceTitan Admin Access</div>
                    <div className="text-sm text-neutral-600">Temporary access to connect Kestrel (revocable anytime)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Job Type List</div>
                    <div className="text-sm text-neutral-600">Your standard service types and typical durations</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Service Areas</div>
                    <div className="text-sm text-neutral-600">ZIP codes or cities you serve</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Pricing Guidelines (Optional)</div>
                    <div className="text-sm text-neutral-600">If you want AI to quote prices during calls</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">30 Minutes of Your Time</div>
                    <div className="text-sm text-neutral-600">For the setup call and testing</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-green-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700 mb-2">30 Minutes</div>
                  <div className="text-sm text-neutral-600">Total setup time from start to live</div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="benefits"
          background="gray"
          title="Benefits of ServiceTitan Integration"
          subtitle="Why HVAC companies love native integration"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Eliminate Manual Data Entry</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold text-red-600 mb-2">5-10 min</div>
                <div className="text-neutral-700">Wasted per call with manual entry</div>
              </div>
              <p className="text-neutral-700 mb-4">
                Without integration, your team spends 5-10 minutes per call manually entering customer info, appointment details, 
                and call notes into ServiceTitan. With 50 calls/week, that's 4-8 hours of wasted time.
              </p>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                <div className="font-semibold text-neutral-900 mb-1">With Kestrel:</div>
                <div className="text-sm text-neutral-700">Zero manual entry. Everything syncs automatically in real-time.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Increase Booking Rates</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">81%</div>
                <div className="text-neutral-700">Booking rate with instant scheduling</div>
              </div>
              <p className="text-neutral-700 mb-4">
                When customers can book appointments while on the phone (vs. "I'll call you back"), booking rates jump from 58% 
                to 81%. That's 40% more jobs booked from the same call volume.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                <div className="font-semibold text-neutral-900 mb-1">Revenue Impact:</div>
                <div className="text-sm text-neutral-700">+$35,420/month for company with 400 calls/month</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Reduce Data Entry Errors</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">15%</div>
                <div className="text-neutral-700">Error rate with manual entry</div>
              </div>
              <p className="text-neutral-700 mb-4">
                Manual data entry leads to typos in addresses, wrong phone numbers, incorrect appointment times, and missing 
                customer notes. These errors cost time and money to fix.
              </p>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                <div className="font-semibold text-neutral-900 mb-1">With Kestrel:</div>
                <div className="text-sm text-neutral-700">99.9% accuracy. AI captures information correctly every time.</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Improve Technician Efficiency</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                <div className="text-neutral-700">Context before arriving at job</div>
              </div>
              <p className="text-neutral-700 mb-4">
                Technicians see full call transcripts, customer history, and AI-generated summaries in ServiceTitan before they 
                arrive. They know exactly what to expect and bring the right parts.
              </p>
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                <div className="font-semibold text-neutral-900 mb-1">Result:</div>
                <div className="text-sm text-neutral-700">Fewer return trips, higher first-time fix rates, better customer satisfaction</div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Common questions about ServiceTitan integration"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection background="gray">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <Database className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Seamless ServiceTitan Integration?</h2>
            <p className="text-xl mb-8 opacity-90">
              Book appointments instantly, eliminate manual data entry, and give your team complete call context. Setup in 30 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/hvac-ai-answering-service" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Learn More
              </Link>
            </div>
            <p className="text-sm opacity-75 mt-6">ServiceTitan certified • 30-minute setup • Real-time two-way sync</p>
          </div>
        </ContentSection>
      </main>
      <Footer />
    </>
  );
}
