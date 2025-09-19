const PageHeader = ({ children }) => {
  return (
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
      {children}
    </h1>
  );
};

export default PageHeader;
