const BackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center px-3 py-2 border-2 border-[#26282b] text-[#26282b] hover:bg-[#434548] hover:border-[#434548] hover:text-white rounded-lg transition-all duration-300"
    >
      <span className="material-icons-round" style={{ fontSize: "20px" }}>
        home
      </span>
    </button>
  );
};

export default BackButton;
