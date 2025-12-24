'use client';

import { useState } from 'react';

interface FeedbackData {
  sessionId: string;
  engagement: number;
  aiNaturalness: 'yes' | 'somewhat' | 'no';
  mostCompelling: string;
  leastCompelling: string;
  bestSlide: number;
  objections: string;
  interest: 'yes' | 'maybe' | 'no';
  bookingLikelihood: number;
}

interface FeedbackSurveyProps {
  sessionId: string;
  onSubmit?: (data: FeedbackData) => void;
  onSkip?: () => void;
}

/**
 * Post-Demo Feedback Survey
 * Collects structured feedback from prospects
 */
export default function FeedbackSurvey({
  sessionId,
  onSubmit,
  onSkip,
}: FeedbackSurveyProps) {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    sessionId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Send to server
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      onSubmit?.(feedback as FeedbackData);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideNames = [
    'The Problem (Bob\'s story)',
    'Industry Reality (stats)',
    'Old Solutions Don\'t Work',
    'THE SOLUTION (reveal)',
    'How It Works',
    'Why We\'re Different',
    'One More Thing (analytics)',
    'Real Results',
  ];

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        borderRadius: '20px',
        padding: '60px',
        border: '1px solid rgba(0, 255, 180, 0.2)',
      }}>
        {/* Header */}
        <h2 style={{
          color: '#00FFB4',
          fontSize: '32px',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          Quick Feedback
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '16px',
          marginBottom: '40px',
          textAlign: 'center',
        }}>
          Help us improve the demo (2 minutes)
        </p>

        {/* Progress */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '40px',
        }}>
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                background: s <= step ? '#00FFB4' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                transition: 'all 300ms',
              }}
            />
          ))}
        </div>

        {/* Step 1: Engagement */}
        {step === 1 && (
          <div>
            <h3 style={{ color: '#e0e0e0', fontSize: '20px', marginBottom: '20px' }}>
              How engaging was the demo?
            </h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setFeedback({ ...feedback, engagement: n })}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: feedback.engagement === n 
                      ? '#00FFB4' 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: feedback.engagement === n ? '#000' : '#e0e0e0',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!feedback.engagement}
              style={{
                width: '100%',
                padding: '16px',
                background: feedback.engagement ? '#00FFB4' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                color: feedback.engagement ? '#000' : 'rgba(255, 255, 255, 0.3)',
                fontSize: '16px',
                cursor: feedback.engagement ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: AI Naturalness & Best Slide */}
        {step === 2 && (
          <div>
            <h3 style={{ color: '#e0e0e0', fontSize: '20px', marginBottom: '20px' }}>
              Did the AI presenter feel natural?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
              {[
                { value: 'yes', label: 'Yes, couldn\'t tell it was AI' },
                { value: 'somewhat', label: 'Somewhat, but still impressive' },
                { value: 'no', label: 'No, felt robotic' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFeedback({ ...feedback, aiNaturalness: option.value as any })}
                  style={{
                    padding: '16px',
                    background: feedback.aiNaturalness === option.value 
                      ? 'rgba(0, 255, 180, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: feedback.aiNaturalness === option.value 
                      ? '2px solid #00FFB4' 
                      : '2px solid transparent',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <h3 style={{ color: '#e0e0e0', fontSize: '20px', marginBottom: '20px' }}>
              Which slide resonated most?
            </h3>
            <select
              value={feedback.bestSlide || ''}
              onChange={(e) => setFeedback({ ...feedback, bestSlide: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '16px',
                marginBottom: '30px',
              }}
            >
              <option value="">Select a slide...</option>
              {slideNames.map((name, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}. {name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setStep(3)}
              disabled={!feedback.aiNaturalness || !feedback.bestSlide}
              style={{
                width: '100%',
                padding: '16px',
                background: (feedback.aiNaturalness && feedback.bestSlide) ? '#00FFB4' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                color: (feedback.aiNaturalness && feedback.bestSlide) ? '#000' : 'rgba(255, 255, 255, 0.3)',
                fontSize: '16px',
                cursor: (feedback.aiNaturalness && feedback.bestSlide) ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 3: Open Feedback */}
        {step === 3 && (
          <div>
            <h3 style={{ color: '#e0e0e0', fontSize: '20px', marginBottom: '20px' }}>
              What was MOST compelling?
            </h3>
            <textarea
              value={feedback.mostCompelling || ''}
              onChange={(e) => setFeedback({ ...feedback, mostCompelling: e.target.value })}
              placeholder="What stood out to you?"
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '16px',
                marginBottom: '20px',
                minHeight: '80px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />

            <h3 style={{ color: '#e0e0e0', fontSize: '20px', marginBottom: '20px' }}>
              Any concerns or objections?
            </h3>
            <textarea
              value={feedback.objections || ''}
              onChange={(e) => setFeedback({ ...feedback, objections: e.target.value })}
              placeholder="What's holding you back?"
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '16px',
                marginBottom: '30px',
                minHeight: '80px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />

            <button
              onClick={() => setStep(4)}
              style={{
                width: '100%',
                padding: '16px',
                background: '#00FFB4',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 4: Interest & Booking */}
        {step === 4 && (
          <div>
            <h3 style={{ color: '#e0e0e0', fontSize: '20px', marginBottom: '20px' }}>
              Would you use this for your business?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
              {[
                { value: 'yes', label: 'Yes, definitely interested' },
                { value: 'maybe', label: 'Maybe, need more info' },
                { value: 'no', label: 'No, not for me' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFeedback({ ...feedback, interest: option.value as any })}
                  style={{
                    padding: '16px',
                    background: feedback.interest === option.value 
                      ? 'rgba(0, 255, 180, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: feedback.interest === option.value 
                      ? '2px solid #00FFB4' 
                      : '2px solid transparent',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <h3 style={{ color: '#e0e0e0', fontSize: '20px', marginBottom: '20px' }}>
              How likely to book a follow-up? (1-10)
            </h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setFeedback({ ...feedback, bookingLikelihood: n })}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: feedback.bookingLikelihood === n 
                      ? '#00FFB4' 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: feedback.bookingLikelihood === n ? '#000' : '#e0e0e0',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!feedback.interest || !feedback.bookingLikelihood || isSubmitting}
              style={{
                width: '100%',
                padding: '16px',
                background: (feedback.interest && feedback.bookingLikelihood) ? '#00FFB4' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                color: (feedback.interest && feedback.bookingLikelihood) ? '#000' : 'rgba(255, 255, 255, 0.3)',
                fontSize: '16px',
                cursor: (feedback.interest && feedback.bookingLikelihood) ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        )}

        {/* Skip button */}
        <button
          onClick={onSkip}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
