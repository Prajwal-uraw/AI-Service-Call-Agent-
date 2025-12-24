'use client';

interface DialerKeypadProps {
  onDigitPress: (digit: string) => void;
  disabled?: boolean;
}

export default function DialerKeypad({ onDigitPress, disabled = false }: DialerKeypadProps) {
  const keys = [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' },
    { digit: '0', letters: '+' },
    { digit: '#', letters: '' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {keys.map((key) => (
        <button
          key={key.digit}
          onClick={() => onDigitPress(key.digit)}
          disabled={disabled}
          className="aspect-square rounded-full bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-2xl font-semibold text-neutral-900">{key.digit}</span>
            {key.letters && (
              <span className="text-xs text-neutral-600 font-medium">{key.letters}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
