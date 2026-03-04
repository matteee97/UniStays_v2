const ChatLoading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#228E8D] mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento chat...</p>
      </div>
    </div>
  );
};

export default ChatLoading;
