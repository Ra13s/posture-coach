export default function Disclaimer({ onAgree }) {
  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Posture Coach - Disclaimer</h2>
      <p style={{ marginBottom: '20px', lineHeight: 1.5 }}>
        This app provides posture routines and general guidance. It does not replace medical advice. 
        Stop if you feel pain and consult a healthcare professional.
      </p>
      <button 
        onClick={onAgree}
        style={{
          padding: '12px 24px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        I Understand - Continue
      </button>
    </div>
  )
}
