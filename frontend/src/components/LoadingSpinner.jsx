const LoadingSpinner = ({ label = 'Analyzing with Gemini AI…' }) => {
  return (
    <div className="spinner-container animate-fade-in">
      <div className="spinner-ring">
        <div className="spinner-ring__track" />
      </div>
      <p className="spinner-label">{label}</p>
      <p className="text-sm text-muted">This may take 10–20 seconds</p>
    </div>
  );
};

export default LoadingSpinner;
