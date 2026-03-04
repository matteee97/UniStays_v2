const GreenContainer = ({ children, className = "" }) => {
  return (
    <div className={`bg-[#D4F1EF] p-3 rounded-3xl ${className}`}>
      {children}
    </div>
  );
};

export default GreenContainer;
